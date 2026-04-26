# TASK_03 - Backup DB Et Bootstrap Des 2 Admins

## Objectif

Conserver les 2 profils existants et les promouvoir en admins sans recreer `auth.users`.

## Contrainte Connue

- Le projet Supabase est lie.
- Le CLI demande le mot de passe DB pour dumper la base distante.
- Le user confirme qu'il n'y a actuellement que 2 profils en DB.

## Strategie

- Ne pas seeder `auth.users`.
- Ne pas committer de dump contenant des donnees personnelles.
- Faire une migration de donnees idempotente et defensive.
- Echouer si `public.profiles` ne contient pas exactement 2 lignes.

## Triage - Ordre D'Execution

| Priorite | Item | Effort | Risque | Action |
| --- | --- | --- | --- | --- |
| P0 | Confirmer le projet/environnement Supabase | S | Eleve | Verifier ref/projet avant dump/migration |
| P0 | Backup ou dump hors repo | S/M | Eleve | Utiliser password DB ou backup Dashboard |
| P0 | Preflight SQL | S | Moyen | Confirmer `profile_count = 2` |
| P1 | Creer migration via CLI | S | Moyen | Utiliser `supabase migration new bootstrap_existing_admins` |
| P1 | Ajouter migration defensive | S | Moyen | `DO $$` avec garde `count = 2` |
| P1 | Appliquer et valider | S | Eleve | Appliquer seulement apres backup/preflight |
| P2 | Tester acces app | S | Faible | Les 2 comptes atteignent `/admin` |

Ne pas inventer le nom de fichier migration a la main: passer par la CLI Supabase.

## Preflight

Verifier avant migration:

```sql
select count(*) as profile_count from public.profiles;

select id, email, x_handle, full_name, status, is_admin, onboarding_completed, created_at
from public.profiles
order by created_at, id;
```

Critere: `profile_count = 2`.

## Backup

Option recommandee:

- Recuperer le mot de passe DB Supabase.
- Executer un dump hors repo.
- Ne jamais stocker le dump dans Git.

Alternative:

- Creer un backup depuis le Dashboard Supabase avant migration.
- Documenter l'heure et l'environnement du backup.

## Migration Proposee

```sql
do $$
declare
  profile_count integer;
  admin_count integer;
begin
  select count(*) into profile_count
  from public.profiles;

  if profile_count <> 2 then
    raise exception
      'Refusing admin bootstrap: expected exactly 2 profiles, found %',
      profile_count;
  end if;

  update public.profiles
  set
    is_admin = true,
    status = 'approved',
    onboarding_completed = true,
    updated_at = now();

  select count(*) into admin_count
  from public.profiles
  where is_admin is true
    and status = 'approved'
    and onboarding_completed is true;

  if admin_count <> 2 then
    raise exception
      'Admin bootstrap failed: expected exactly 2 approved onboarded admins, found %',
      admin_count;
  end if;
end $$;
```

## Pourquoi `onboarding_completed = true`

Les admins doivent pouvoir tester l'app directement. Sans cela, les guards peuvent les forcer vers `/onboarding`.

## Validation Post-Migration

```sql
select count(*) as profile_count from public.profiles;

select count(*) as admin_count
from public.profiles
where is_admin is true
  and status = 'approved'
  and onboarding_completed is true;

select id, email, x_handle, status, is_admin, onboarding_completed
from public.profiles
order by created_at, id;
```

## Rollback

Preferer un rollback cible base sur le snapshot pre-migration.

Ne pas faire de restore complet si des ecritures ont eu lieu apres la migration, sauf fenetre de maintenance controlee.

## Critères De Completion

- Backup confirme ou dump hors repo disponible.
- Migration creee via CLI avec garde `count = 2`.
- Les 2 profils sont `is_admin = true`, `status = 'approved'`, `onboarding_completed = true`.
- Les 2 comptes peuvent acceder a `/admin`.
- Aucun autre profil n'est modifie.

## Risques

- Appliquer la migration sur le mauvais projet Supabase.
- Commettre un dump contenant des donnees personnelles.
- Rendre la migration non portable volontairement via `count = 2`; acceptable pour ce bootstrap cible.

## Temoin - Corrections Integrees

- `is_admin=true` seul ne suffit pas.
- Ajouter `status='approved'`.
- Ajouter `onboarding_completed=true` pour acces direct admin.
- Ne pas toucher `sponsor_approved`.
