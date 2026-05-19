# Hotfix regression DB - recursion RLS `profiles`

## Contexte

Une regression RLS provoque des erreurs `500` Supabase sur les lectures de
`public.profiles`.

Erreur observee :

```json
{
  "code": "42P17",
  "message": "infinite recursion detected in policy for relation \"profiles\""
}
```

Exemple de requete impactee :

```text
GET /rest/v1/profiles?select=status,onboarding_completed&id=eq.<user_id>
```

La regression vient de la policy ajoutee pour permettre a un sponsor de lire le
profil du demandeur dans `/parrainages`.

## Cause

La policy suivante sur `public.profiles` lit `public.sponsorship_requests` :

```sql
CREATE POLICY "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sponsorship_requests sr
      WHERE sr.requester_id = profiles.id
        AND sr.sponsor_id = (SELECT auth.uid())
    )
  );
```

Mais `public.sponsorship_requests` possede des policies admin qui relisent
`public.profiles` :

```sql
CREATE POLICY "Admins can view all sponsorship requests"
  ON public.sponsorship_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
```

Postgres evalue donc :

```text
profiles policy
-> sponsorship_requests RLS
-> profiles policy
-> recursion infinie
```

## Impact

- Les lectures basiques de profil peuvent retourner `500`.
- Les routes qui dependent de `status` ou `onboarding_completed` peuvent casser.
- Les flows auth, attente, onboarding, layout app et admin peuvent etre touches.
- Le correctif parrainage reste incomplet tant que `/parrainages` ne peut pas
  lire proprement le profil du demandeur.

## Hotfix immediat

Objectif : restaurer les lectures `profiles` sans attendre une correction
structurelle.

SQL a appliquer en urgence :

```sql
DROP POLICY IF EXISTS "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles;
```

Effet attendu :

- Les lectures `profiles` ne recursent plus via `sponsorship_requests`.
- Les erreurs `42P17` doivent disparaitre sur les endpoints `profiles`.

Limite connue :

- `/parrainages` peut de nouveau afficher un demandeur incomplet ou `@inconnu`
  pour les demandes pending, selon les autres policies visibles par le sponsor.

## Point de securite a integrer dans la RFC

- Le pattern `SECURITY DEFINER` casse bien la recursion RLS.
- Une policy `SELECT` sur `public.profiles` ouvre toute la ligne profil.
- RLS filtre des lignes, pas des colonnes.
- `public.profiles` contient des champs sensibles (`email`, `phone`, `status`,
  `is_admin`, `sponsored_by`, `onboarding_completed`, etc.).

Conclusion : il faut separer la correction de recursion et le niveau
d'exposition des donnees profil.

## Correction durable retenue

Objectif : supprimer la recursion sans surexposer `public.profiles`.

Approche : fournir une fonction dediee qui retourne uniquement les colonnes
necessaires, filtrees par `sponsor_id = auth.uid()`.

Important :

- ne pas recreer de policy `SELECT` sponsor sur `public.profiles` ;
- garder la fonction privilegiee `SECURITY DEFINER` dans le schema `private` ;
- exposer a la Data API seulement un wrapper `public` non privilegie.

Migration proposee :

```sql
CREATE SCHEMA IF NOT EXISTS private;

REVOKE CREATE ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.get_sponsor_requester_profiles()
RETURNS TABLE (
  sponsorship_request_id UUID,
  requester_id UUID,
  x_handle TEXT,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    sr.id AS sponsorship_request_id,
    p.id AS requester_id,
    p.x_handle,
    p.full_name,
    p.avatar_url
  FROM public.sponsorship_requests sr
  JOIN public.profiles p
    ON p.id = sr.requester_id
  WHERE sr.sponsor_id = (SELECT auth.uid())
    AND (SELECT auth.uid()) IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION private.get_sponsor_requester_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.get_sponsor_requester_profiles() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_sponsor_requester_profiles()
RETURNS TABLE (
  sponsorship_request_id UUID,
  requester_id UUID,
  x_handle TEXT,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT *
  FROM private.get_sponsor_requester_profiles();
$$;

REVOKE ALL ON FUNCTION public.get_sponsor_requester_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_sponsor_requester_profiles() TO authenticated;
```

Le front `/parrainages` lit alors les infos demandeur via RPC
`get_sponsor_requester_profiles()` au lieu de dependre d'une policy sponsor
sur `public.profiles`.

## Pourquoi cette correction durable

Le repo utilise deja ce pattern pour casser une recursion RLS sur
`channel_members` :

```text
private.is_current_user_channel_member(...)
```

Le meme principe s'applique pour casser la recursion :

- aucune policy `profiles` ne requete `sponsorship_requests` ;
- la fonction privee `SECURITY DEFINER` lit `sponsorship_requests` et `profiles`
  hors evaluation RLS de l'appelant ;
- le wrapper public retourne uniquement les champs utiles a `/parrainages`.

Hypotheses a verifier avant prod :

- le role proprietaire des fonctions `SECURITY DEFINER` est bien attendu ;
- `FORCE ROW LEVEL SECURITY` n'est pas active sur les tables impliquees ;
- les objets references restent schema-qualifies ;
- le schema `private` n'est pas expose dans la Data API.
- la fonction publique reste `SECURITY INVOKER`.

## Validation

### Validation hotfix

1. Appliquer le `DROP POLICY`.
2. Rejouer la requete qui cassait :

```text
GET /rest/v1/profiles?select=status,onboarding_completed&id=eq.<user_id>
```

Resultat attendu :

- pas de `500` ;
- pas de code `42P17` ;
- la ligne du profil courant est lisible si la policy existante le permet.

### Validation correction durable

1. Appliquer la migration durable.
2. Se connecter avec un sponsor ayant une demande adressee.
3. Appeler `POST /rest/v1/rpc/get_sponsor_requester_profiles`.
4. Verifier que la reponse contient uniquement
   `sponsorship_request_id`, `requester_id`, `x_handle`, `full_name`,
   `avatar_url`.
5. Verifier qu'un utilisateur authentifie non sponsor ne lit pas de lignes
   hors perimetre.
6. Verifier que la requete `profiles` de base ne retourne plus `42P17`.
7. Verifier que `/parrainages` affiche toujours les infos demandeur attendues.
8. Verifier qu'un sponsor ne peut pas lire les champs sensibles du demandeur
   via `GET /rest/v1/profiles`.

## Rollback

Rollback :

```sql
DROP POLICY IF EXISTS "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles;

DROP FUNCTION IF EXISTS public.get_sponsor_requester_profiles();
DROP FUNCTION IF EXISTS private.get_sponsor_requester_profiles();
```

Note : ne pas toucher aux grants globaux du schema `private`, deja utilises par
d'autres helpers RLS.

## Decision recommandee

1. Appliquer le hotfix immediat si l'environnement est bloque.
2. Implementer la correction durable least privilege ci-dessus.
3. Mettre a jour `/parrainages` pour utiliser
   `get_sponsor_requester_profiles()`.
4. Verifier en SQL et via `/parrainages` avec cas positifs et negatifs.
5. Mettre a jour les tests d'authorization hardening pour confirmer qu'aucune
   policy `profiles` ne requete `public.sponsorship_requests`.
