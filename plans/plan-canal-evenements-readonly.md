# Plan canal Evenements readonly

Statut : plan de cadrage avant implementation  
Date : 15 mai 2026  
Perimetre : chat, Supabase/Postgres, RLS, reactions, interface chat, tests et verification

## 1. Objectif

Ajouter un canal de chat dedie aux evenements de la communaute, sur le meme modele que `Jobs` :

- le canal est visible par les membres approuves ;
- seuls les administrateurs peuvent publier des messages ;
- tous les membres autorises a lire le canal peuvent reagir aux messages ;
- les auteurs peuvent reagir a leurs propres messages ;
- le canal est inclus dans la taxonomie canonique des salons de lancement ;
- la recherche globale de messages inclut ce nouveau canal ;
- les garde-fous RLS restent centres sur l'acces au message cible, pas seulement sur le statut membre.

Le point central : ne pas traiter les reactions comme une simple exception UI. L'autorisation doit etre coherente en base, dans le store chat et dans l'affichage.

## 2. Doctrine produit

Le canal `Evenements` est un canal d'annonces communautaires. Il sert a publier des evenements, rendez-vous, rencontres, appels a participation ou informations datees utiles aux membres de MarcheLibre.

Regles produit a acter :

- le canal est collectif et lisible par les membres approuves ;
- le canal n'est pas un espace de discussion libre ;
- les admins publient les annonces principales ;
- les membres peuvent reagir pour montrer leur interet, y compris sur leurs propres messages dans les autres salons ;
- le droit de reaction depend du droit de lecture du message cible ;
- les membres non approuves, anonymes ou refuses ne doivent pas lire ni reagir ;
- le canal doit rester dans le centre MVP `/chat` et suivre les conventions de `Jobs`.

Nom et slug recommandes :

| Champ | Valeur recommandee |
| --- | --- |
| Nom affiche | `Evenements` |
| Slug | `evenements` |
| Description | `Annonces et evenements de la communaute` |
| Lecture | `all` |
| Ecriture | `admin_only` |
| Visibilite | public, non prive |

## 3. Etat actuel et constats

Fichiers et migrations concernes :

- `src/lib/chat/channels.ts`
- `src/app/(app)/chat/layout.tsx`
- `src/components/layout/header.tsx`
- `src/components/chat/chat-layout.tsx`
- `src/components/chat/message-area.tsx`
- `src/components/chat/chat-store.tsx`
- `src/__tests__/authorization-hardening.test.ts`
- `supabase/migrations/20260513230000_us3_launch_channel_taxonomy.sql`
- `supabase/migrations/20260511140740_prevent_self_message_reactions.sql`
- `supabase/migrations/20260503065247_harden_authorization_boundaries.sql`
- `supabase/migrations/20260513170000_chat_images_private_storage.sql`

Constats techniques :

- les canaux publics charges par le chat sont filtres via `LAUNCH_CHAT_CHANNEL_SLUGS` ;
- `Jobs` existe deja avec `write_permission = 'admin_only'` ;
- les policies `messages` utilisent deja `channels.write_permission` pour l'insertion et la mise a jour ;
- le blocage des self-reactions existe a la fois en base et en client ;
- la policy initiale de lecture des reactions est trop large, car elle permet a tout membre approuve de lire les reactions sans verifier l'acces au message cible ;
- la suppression de messages peut encore dependre d'une policy historique qui ne respecte pas forcement `write_permission`.

## 4. Decisions fonctionnelles

Decisions recommandees :

1. Le nouveau salon utilise le slug `evenements`.
2. Il est ajoute apres `jobs` dans l'ordre des canaux.
3. Les non-admins ne voient pas un composer actif dans ce canal.
4. Le message d'interdiction doit etre specifique :

> Seuls les admins peuvent publier dans Evenements.

5. Les reactions sont autorisees si l'utilisateur peut lire le message cible.
6. Les reactions a ses propres messages sont autorisees.
7. Les reactions restent limitees aux membres authentifies et approuves.
8. Les reactions ne doivent pas ouvrir de fuite sur les messages de canaux prives.

Point produit a trancher avant implementation finale :

- les membres `chat_banned` ou `chat_muted_until` doivent-ils pouvoir reagir ?

Recommandation : un membre banni du chat ne devrait pas pouvoir reagir. Un membre mute peut eventuellement lire, mais ne devrait pas creer de nouvelle interaction sociale tant que le mute est actif. Cette regle doit etre confirmee avant de durcir la policy.

## 5. Audit base de donnees avant migration

Avant toute migration, verifier la base reelle, pas seulement les fichiers du depot.

Inventaire minimal :

```sql
select id, name, slug, is_private, read_permission, write_permission
from public.channels
where slug in ('jobs', 'evenements');
```

Verifier les policies courantes :

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('channels', 'messages', 'message_reactions')
order by tablename, policyname;
```

Verifier les fonctions privees deja disponibles :

```sql
select n.nspname as schema_name, p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
  and p.proname in (
    'is_admin',
    'can_current_user_access_chat_media_path',
    'can_current_user_read_chat_message'
  )
order by schema_name, function_name;
```

Objectif de l'audit :

- confirmer que `evenements` n'existe pas deja ;
- confirmer que `jobs` est bien `admin_only` en ecriture ;
- confirmer la forme exacte des policies `message_reactions` en production ;
- verifier s'il existe deja un helper de lisibilite reutilisable ;
- eviter une migration qui remplace une policy plus recente non visible dans les fichiers locaux.

## 6. Migration canal Evenements

Creer une nouvelle migration avec la CLI Supabase, par exemple :

```bash
supabase migration new add_evenements_readonly_channel
```

Ne pas modifier la migration historique `20260513230000_us3_launch_channel_taxonomy.sql`, car elle peut deja etre appliquee.

SQL cible :

```sql
insert into public.channels (
  name,
  slug,
  description,
  is_private,
  read_permission,
  write_permission
)
values (
  'Evenements',
  'evenements',
  'Annonces et evenements de la communaute',
  false,
  'all',
  'admin_only'
)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  is_private = false,
  read_permission = 'all',
  write_permission = 'admin_only';
```

Comportement attendu :

- migration idempotente ;
- aucun message existant n'est deplace ;
- aucun canal legacy n'est supprime ;
- aucune permission de lecture admin-only n'est introduite ;
- le canal reste compatible avec le chargement public du chat.

## 7. RLS reactions et self-reactions

La migration existante `20260511140740_prevent_self_message_reactions.sql` bloque les self-reactions avec une condition du type :

```sql
m.author_id <> (select auth.uid())
```

Cette contrainte doit etre retiree.

Il ne faut pas revenir a une policy trop large du type :

```sql
user_id = auth.uid()
and exists (
  select 1 from public.profiles
  where id = auth.uid() and status = 'approved'
)
```

Cette ancienne forme autorise l'insertion d'une reaction sur n'importe quel `message_id` connu par un membre approuve, sans verifier que le message cible est lisible.

Regle cible :

- un utilisateur peut lire une reaction seulement s'il peut lire le message cible ;
- un utilisateur peut ajouter une reaction seulement s'il peut lire le message cible ;
- un utilisateur ne peut ajouter une reaction qu'en son propre nom ;
- un utilisateur peut supprimer uniquement ses propres reactions ;
- les self-reactions sont autorisees.

Helper recommande :

```sql
create or replace function private.can_current_user_read_chat_message(
  target_message_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.messages m on m.id = target_message_id
    join public.channels c on c.id = m.channel_id
    where p.id = (select auth.uid())
      and p.status = 'approved'
      and (
        coalesce(c.read_permission, 'all') = 'all'
        or p.is_admin = true
      )
      and (
        c.is_private = false
        or p.is_admin = true
        or exists (
          select 1
          from public.channel_members cm
          where cm.channel_id = c.id
            and cm.user_id = p.id
        )
      )
  );
$$;

revoke all on function private.can_current_user_read_chat_message(uuid)
from public;

grant execute on function private.can_current_user_read_chat_message(uuid)
to authenticated;
```

Policies cible :

```sql
drop policy if exists "Approved users can view reactions"
on public.message_reactions;

create policy "Approved users can view reactions"
  on public.message_reactions for select
  to authenticated
  using (
    (select private.can_current_user_read_chat_message(message_id))
  );

drop policy if exists "Users can add reactions"
on public.message_reactions;

create policy "Users can add reactions"
  on public.message_reactions for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.can_current_user_read_chat_message(message_id))
  );
```

Option de durcissement a valider :

```sql
and exists (
  select 1
  from public.profiles p
  where p.id = (select auth.uid())
    and p.status = 'approved'
    and coalesce(p.chat_banned, false) = false
    and (p.chat_muted_until is null or p.chat_muted_until <= now())
)
```

Cette option ferait des reactions une action de participation au chat, donc bloquee pendant un ban ou un mute.

## 8. Readonly messages, edition et suppression

Les policies `messages` couvrent deja l'insertion et la mise a jour avec `write_permission`. Cela suffit pour empecher un non-admin de publier dans `Evenements`.

Point de vigilance : la suppression de messages peut encore venir d'une policy historique du type :

```sql
author_id = auth.uid() or public.is_admin()
```

Si un non-admin n'a jamais pu publier dans `Evenements`, ce risque est faible pour le nouveau canal. En revanche, pour une definition stricte de readonly, il faut durcir aussi `DELETE`.

Regle stricte recommandee :

- admin : peut supprimer ;
- auteur : peut supprimer seulement dans un canal writable pour lui ;
- canal `admin_only` : suppression reservee admin.

Policy cible a envisager :

```sql
drop policy if exists "Users can delete own messages" on public.messages;

create policy "Users can delete own messages"
  on public.messages for delete
  to authenticated
  using (
    (select public.is_admin())
    or (
      author_id = (select auth.uid())
      and exists (
        select 1
        from public.channels c
        where c.id = messages.channel_id
          and coalesce(c.write_permission, 'all') = 'all'
          and (
            c.is_private = false
            or exists (
              select 1
              from public.channel_members cm
              where cm.channel_id = messages.channel_id
                and cm.user_id = (select auth.uid())
            )
          )
      )
    )
  );
```

Cette partie peut etre incluse dans le meme chantier si le produit confirme que readonly signifie aucune mutation non-admin, pas seulement aucune publication.

## 9. Adaptations applicatives

### 9.1 Taxonomie des canaux

Fichier : `src/lib/chat/channels.ts`

Ajouter `evenements` a `LAUNCH_CHAT_CHANNEL_SLUGS`.

Ordre recommande :

```ts
export const LAUNCH_CHAT_CHANNEL_SLUGS = [
  "general",
  "business",
  "politique",
  "divers",
  "jobs",
  "evenements",
] as const;
```

Effets attendus :

- le layout chat charge le canal via `.in("slug", [...LAUNCH_CHAT_CHANNEL_SLUGS])` ;
- la recherche globale du header inclut le canal ;
- le tri reste determine par `sortLaunchChatChannels`.

### 9.2 Message readonly dans le chat

Fichier : `src/components/chat/chat-layout.tsx`

La logique actuelle calcule :

```ts
activeChannel.write_permission === "all" || Boolean(isAdmin)
```

Cette logique est correcte.

Ajouter une branche de message specifique :

```ts
if (activeChannel.slug === "evenements") {
  return "Seuls les admins peuvent publier dans Evenements.";
}
```

Conserver le fallback generique pour les futurs salons restreints.

### 9.3 Self-reactions cote UI

Fichier : `src/components/chat/message-area.tsx`

Le composant coupe aujourd'hui `onReact` pour ses propres messages avec une logique du type :

```ts
const reactionHandler = isOwnMessage ? undefined : handleReact;
```

Comportement cible :

```ts
const reactionHandler = handleReact;
```

ou suppression complete de la variable si elle ne sert plus.

### 9.4 Self-reactions cote store

Fichier : `src/components/chat/chat-store.tsx`

La fonction `toggleReaction` refuse actuellement les reactions de l'auteur :

```ts
if (!message || message.author_id === userId || message.id.startsWith("optimistic-")) return;
```

Comportement cible :

```ts
if (!message || message.id.startsWith("optimistic-")) return;
```

### 9.5 Agregation et affichage des reactions

Le store filtre aussi les reactions lorsque `r.user_id` correspond a l'auteur du message.

Filtres a retirer :

- `messageAuthorIds.get(r.message_id) === r.user_id`
- `newAuthorIds.get(r.message_id) === r.user_id`

Sans cette correction, les self-reactions seraient bien stockees en base mais invisibles ou mal comptees dans l'interface.

## 10. Tests et verification

Tests source-level a modifier dans `src/__tests__/authorization-hardening.test.ts` :

- taxonomie canonique inclut `evenements` ;
- la migration du canal contient `('Evenements', 'evenements', ..., 'all', 'admin_only')` ou equivalent ;
- le message readonly inclut `Evenements` ;
- la recherche globale continue a utiliser `LAUNCH_CHAT_CHANNEL_SLUGS` ;
- le test `prevents users from reacting to their own chat messages` est remplace.

Nouveau test source-level recommande :

```ts
it("allows users to react to their own chat messages while scoping reactions to readable messages", () => {
  // verifier que le code client ne bloque plus msg.author_id === userId
  // verifier que le store ne filtre plus les reactions de l'auteur
  // verifier que la migration ne contient plus m.author_id <> auth.uid()
  // verifier que les policies reactions appellent can_current_user_read_chat_message
});
```

Tests DB recommandes si Supabase local est disponible :

| Scenario | Resultat attendu |
| --- | --- |
| membre approuve lit `evenements` | autorise |
| membre approuve insere un message dans `evenements` | refuse |
| admin insere un message dans `evenements` | autorise |
| membre approuve reagit au message admin dans `evenements` | autorise |
| auteur reagit a son propre message dans un canal writable | autorise |
| membre non approuve reagit | refuse |
| membre sans acces a un canal prive lit les reactions | refuse |
| membre sans acces a un canal prive ajoute une reaction | refuse |
| membre supprime sa propre reaction | autorise |
| membre supprime la reaction d'un autre | refuse |

Commandes de verification recommandees :

```bash
bun test
bun run check
supabase test db
```

Si `supabase test db` n'est pas disponible ou si la base locale n'est pas configuree, documenter explicitement la limite de verification.

## 11. Ordre d'execution recommande

1. Confirmer le nom, le slug et le wording final du canal.
2. Auditer les policies en production ou sur une copie representative.
3. Creer la migration Supabase avec `supabase migration new`.
4. Ajouter l'upsert du canal `evenements`.
5. Ajouter ou remplacer le helper de lecture des messages.
6. Remplacer les policies `message_reactions` SELECT et INSERT.
7. Decider si `messages DELETE` doit etre durci dans le meme chantier.
8. Ajouter `evenements` a `LAUNCH_CHAT_CHANNEL_SLUGS`.
9. Ajouter le message readonly specifique dans le layout chat.
10. Retirer les blocages client de self-reaction.
11. Mettre a jour les tests source-level.
12. Lancer les tests et noter les echecs preexistants separement.
13. Relire la migration avant application production.

## 12. Rollback et securite

Rollback fonctionnel du canal :

```sql
update public.channels
set read_permission = 'admin_only'
where slug = 'evenements';
```

Cette option cache le canal aux non-admins sans supprimer les donnees.

Rollback complet du canal, uniquement si aucun message utile n'existe :

```sql
delete from public.channels
where slug = 'evenements';
```

Cette suppression doit etre evitee si des messages ou reactions existent deja.

Rollback des reactions :

- conserver l'ancien SQL de policy dans le diff de migration ;
- restaurer temporairement la condition anti-self-reaction uniquement si un probleme produit est constate ;
- ne pas restaurer une policy reaction trop large qui fuit les reactions de canaux prives.

Avant production :

- sauvegarder ou confirmer la politique de backup Supabase ;
- verifier les advisors Supabase si disponibles ;
- eviter toute action destructive directe sur la base production ;
- appliquer la migration pendant une fenetre a faible activite si possible.

## 13. Points a valider

Points produit :

- nom final : `Evenements` ou `Evénements` si le projet accepte les accents dans les libelles ;
- slug final : `evenements` ;
- position dans la sidebar ;
- description finale ;
- reactions autorisees pour utilisateurs mutes ou bannis ;
- definition stricte de readonly : publication seulement, ou edition/suppression aussi.

Points techniques :

- presence eventuelle d'un helper RLS existant a reutiliser ;
- compatibilite avec les policies deja appliquees en production ;
- comportement attendu des subscriptions realtime sur `message_reactions` apres durcissement SELECT ;
- impact des self-reactions sur les compteurs existants ;
- couverture locale possible pour les tests DB.

## 14. Definition de termine

Le chantier est termine lorsque :

- le canal `evenements` existe en base avec `read_permission = 'all'` et `write_permission = 'admin_only'` ;
- les membres approuves voient le canal ;
- les non-admins ne peuvent pas publier dans le canal ;
- les admins peuvent publier dans le canal ;
- les membres autorises peuvent reagir aux messages visibles ;
- les auteurs peuvent reagir a leurs propres messages ;
- les reactions ne sont lisibles et inserables que pour des messages accessibles ;
- les canaux prives ne fuitent pas leurs reactions ;
- le canal apparait dans la sidebar et la recherche globale ;
- le composer affiche un message readonly clair pour les non-admins ;
- les tests source-level et les tests DB pertinents passent ou documentent les limites de verification ;
- aucun changement hors perimetre n'a ete introduit.
