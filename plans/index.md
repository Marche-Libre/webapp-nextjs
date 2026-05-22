# Directory Index

## Conclusion rapide

Ordre estime du plus simple au plus long :

1. **[rfc-parrainage-obligatoire-admin-admission.md](./rfc-parrainage-obligatoire-admin-admission.md)** - Parrainage obligatoire et validation admin finale
2. **[search-message-scroll.md](./search-message-scroll.md)** - Saut depuis recherche canal
3. **[parrainage-afficher-parrain-filleul.md](./parrainage-afficher-parrain-filleul.md)** - Afficher le parrain au filleul
4. **[triage-utilisateurs-canaux.md](./triage-utilisateurs-canaux.md)** - Participants par canal actif
5. **[plan-canal-evenements-readonly.md](./plan-canal-evenements-readonly.md)** - Canal Evenements admin-only
6. **[suppression-message-media.md](./suppression-message-media.md)** - Tombstone messages et medias
7. **[Nostr-integration.md](./Nostr-integration.md)** - Nostr, wallet, zaps Lightning
8. **[plan-suppression-compte.md](./plan-suppression-compte.md)** - Suppression compte tombstone

Recommandation d'execution : traiter **suppression-message-media** avant **plan-suppression-compte**. Cela valide le modele tombstone + Storage API sur un perimetre plus petit avant le workflow complet de suppression de compte.

## Notes de triage

- **Court terme** : `search-message-scroll.md` est le meilleur candidat si le temps est limite. Perimetre frontend cible, sans migration.
- **Admission/parrainage P0** : `rfc-parrainage-obligatoire-admin-admission.md` corrige l'invariant d'entree: aucun parcours sans parrain, parrainage confirme obligatoire, validation admin finale.
- **Parrainage** : `parrainage-afficher-parrain-filleul.md` est non bloquant, mais utile pour rendre le parcours valide plus comprehensible apres admission.
- **Clos recemment** : `bug-parrainage-admission-profile-form-crash.md` est valide de bout en bout et conserve comme historique du correctif critique admission/parrainage.
- **Moyen terme** : `triage-utilisateurs-canaux.md` et `plan-canal-evenements-readonly.md` touchent chat + Supabase, avec verification RLS.
- **Risque operationnel** : `suppression-message-media.md` introduit Storage non transactionnel, mais reste plus borne que la suppression de compte.
- **Gros chantiers** : `Nostr-integration.md` contient beaucoup d'inconnues externes. `plan-suppression-compte.md` est transversal, sensible juridiquement et techniquement.

## Files

- **[future-scaling-ideas.md](./future-scaling-ideas.md)** - Idees futures hors MVP
- **[bug-parrainage-admission-profile-form-crash.md](./bug-parrainage-admission-profile-form-crash.md)** - Correctif critique admission/parrainage, clos
- **[Nostr-integration.md](./Nostr-integration.md)** - Nostr, wallet, zaps Lightning
- **[rfc-parrainage-obligatoire-admin-admission.md](./rfc-parrainage-obligatoire-admin-admission.md)** - Parrainage obligatoire et validation admin finale
- **[parrainage-afficher-parrain-filleul.md](./parrainage-afficher-parrain-filleul.md)** - Afficher le parrain au filleul
- **[plan-canal-evenements-readonly.md](./plan-canal-evenements-readonly.md)** - Canal Evenements admin-only
- **[plan-suppression-compte.md](./plan-suppression-compte.md)** - Suppression compte tombstone
- **[search-message-scroll.md](./search-message-scroll.md)** - Saut depuis recherche canal
- **[suppression-message-media.md](./suppression-message-media.md)** - Tombstone messages et medias
- **[triage-utilisateurs-canaux.md](./triage-utilisateurs-canaux.md)** - Participants par canal actif

## Subdirectories

### archive/

- **[is-user-online.md](./archive/is-user-online.md)** - Review presence utilisateur V1
- **[onboarding-non-bloquant.md](./archive/onboarding-non-bloquant.md)** - Onboarding reminder non bloquant
