# Architecture actuelle - UI / serveur / DB

Diagrammes Mermaid des grands blocs fonctionnels actuels de l'app.

Portee:
- base sur le code actuel, pas sur le scope PRD theorique
- centre sur les interactions UI, routes/server actions et Supabase
- utile pour comprendre les evenements, methodes et tables touchees

Sources principales:
- `src/lib/supabase/middleware.ts`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/en-attente/page.tsx`
- `src/app/(auth)/en-attente/actions.ts`
- `src/app/onboarding/page.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/chat/layout.tsx`
- `src/components/chat/*`
- `src/app/(app)/parametres/page.tsx`
- `src/app/(app)/notifications/page.tsx`
- `src/app/(app)/admin/*`
- `src/components/sponsorship/*`

## 1. Acces, admission, onboarding et croissance

Points d'entree et methodes cles:
- `AccessModal` -> `OAuthButtons`
- `RejoindrePage.handleSignUp()`
- `/auth/callback` -> `exchangeCodeForSession()`
- `updateSession()` dans le middleware
- `submitAdmissionProfile()`
- `StatusPoller.checkStatus()`
- `SponsorRequestForm.handleSubmit()`
- `InvitationCard.handleAction()`
- `OnboardingWizard.finish()`

### 1.1 Entree publique -> OAuth X -> admission -> onboarding

```mermaid
sequenceDiagram
    actor Visiteur
    participant UI as UI publique<br/>/ ou /rejoindre
    participant OAuth as Supabase Auth / X OAuth
    participant Callback as Route /auth/callback
    participant DB as Supabase DB
    participant MW as Middleware<br/>updateSession()
    participant Wait as UI /en-attente
    participant Onboard as UI /onboarding
    participant Chat as UI /chat

    Visiteur->>UI: Clique "Demander l'acces"<br/>ou "Continuer avec X"
    UI->>OAuth: signInWithOAuth(provider: "x")
    OAuth-->>Callback: Retour avec code
    Callback->>OAuth: exchangeCodeForSession(code)
    Callback->>DB: select profiles(status, onboarding_completed)

    alt profil approuve
        Callback-->>Visiteur: redirect /onboarding ou /chat
    else profil nouveau ou pending
        Callback-->>Visiteur: redirect /en-attente
    end

    Visiteur->>MW: Navigation vers route app
    MW->>DB: select profiles(status, onboarding_completed)

    alt status rejected
        MW-->>Wait: force /en-attente
    else status pending
        MW-->>Wait: force /en-attente
    else approved sans onboarding
        MW-->>Onboard: force /onboarding
    else approved + onboarding
        MW-->>Chat: force /chat
    end

    Visiteur->>Wait: Remplit le formulaire d'admission
    Wait->>DB: submitAdmissionProfile() -> update profiles(...)
    Wait->>DB: StatusPoller.checkStatus() -> select profiles(status, sponsor_approved)

    alt admin approuve ensuite
        Wait-->>Onboard: redirection vers /chat puis middleware -> /onboarding
        Onboard->>DB: update profiles(...)
        Onboard->>DB: update profiles(onboarding_completed = true)
        Onboard->>DB: insert notifications(type = "welcome")
        Onboard-->>Chat: window.location.href = "/chat"
    else toujours pending
        Wait-->>Wait: UI reste sur la frontiere /en-attente
    end
```

### 1.2 Parrainage, invitation et rattachement sponsor

```mermaid
sequenceDiagram
    actor Membre as Membre approuve
    actor Candidat
    participant Join as UI /rejoindre?ref=@handle
    participant Callback as Route /auth/callback
    participant Wait as UI /en-attente
    participant Parrain as UI /parrainages
    participant DB as Supabase DB

    Membre->>Parrain: Copie son lien de parrainage
    Candidat->>Join: Ouvre /rejoindre?ref=@handle
    Join->>Join: stocke cookie ml-referral
    Join->>Callback: lance OAuth X

    Callback->>DB: charge profiles du sponsor par x_handle
    alt sponsor valide + quotas ok
        Callback->>DB: update profiles.sponsored_by
        Callback->>DB: insert sponsorship_requests(status = "pending", attempt_number = 1)
    else sponsor absent ou quota depasse
        Callback->>DB: aucun rattachement automatique
    end
    Callback-->>Wait: redirect /en-attente

    Candidat->>Wait: choisit "Je connais un membre"
    Wait->>DB: insert sponsorship_requests(...)
    DB-->>Wait: router.refresh()

    Membre->>Parrain: consulte "Demandes recues"
    Parrain->>DB: update sponsorship_requests(status = approved|rejected)

    alt demande approuvee par le sponsor
        Wait->>DB: select profiles(status, sponsor_approved)
        Wait-->>Candidat: message "Parrainage confirme"
    else invitation recue
        Candidat->>Wait: accepte/refuse l'invitation
        Wait->>DB: update invitations(status, accepted_by)
    end
```

## 2. Experience membre et parametres

Points d'entree et methodes cles:
- `(app)/layout` pour la frontiere membre
- `ChatLayoutPage` cote serveur
- `ChatStore.loadChannel()`, `watchChannel()`, `loadOlderMessages()`
- `MessageInput.sendMessage()`
- `notifyMentions()`
- `NotificationsList.markAsRead()` / `markAllAsRead()`
- `ParametresPage.handleToggleDms()` / `handleToggleVisibility()` / `handleLogout()`

### 2.1 Frontiere membre et chargement du chat

```mermaid
flowchart LR
    A["Utilisateur ouvre une route membre"] --> B["Middleware updateSession()"]
    B --> C{Auth + status + onboarding OK ?}
    C -- non --> D["/connexion ou /en-attente ou /onboarding"]
    C -- oui --> E["(app)/layout"]
    E --> F["select profile complet"]
    F --> G["AppShell"]
    G --> H["chat/layout.tsx"]
    H --> I["select channels publics"]
    H --> J["select channel_members -> DMs"]
    H --> K["select members approuves"]
    H --> L["select 50 messages du salon par defaut"]
    I --> M["ChatLayout"]
    J --> M
    K --> M
    L --> M
    M --> N["seedChannel initial"]
    M --> O["MessageArea"]
    O --> P["loadChannel() si necessaire"]
    O --> Q["watchChannel() realtime + poll sync"]
```

### 2.2 Message chat, reactions, mentions et sync realtime

```mermaid
sequenceDiagram
    actor Auteur
    participant Input as UI MessageInput
    participant Store as chat-store
    participant DB as Supabase DB
    participant RT as Realtime Supabase
    participant Mentions as notifyMentions()
    actor Membres as Autres membres

    Auteur->>Input: Saisit puis envoie un message
    Input->>Store: addOptimisticMessage()
    Input->>DB: insert messages(channel_id, author_id, content)

    alt insert OK
        Input->>Store: confirmMessage()
        Input->>Mentions: notifyMentions(content, authorId, type, link)
        Mentions->>DB: insert notifications(...)
    else insert KO
        Input->>Store: markMessageFailed()
    end

    RT-->>Store: event postgres_changes sur messages
    Store->>DB: fetchMessage() ou syncLatestMessages()
    Store-->>Membres: UI mise a jour

    Auteur->>Store: toggleReaction(messageId, emoji)
    Store->>DB: insert/delete message_reactions
    RT-->>Store: event message_reactions
    Store->>DB: fetchReactions()
```

### 2.3 Notifications et parametres

```mermaid
sequenceDiagram
    actor Membre
    participant Notifs as UI /notifications
    participant Settings as UI /parametres
    participant DB as Supabase DB
    participant Auth as Supabase Auth

    Membre->>Notifs: Ouvre la page
    Notifs->>DB: select notifications order by created_at desc
    DB-->>Notifs: 50 notifications initiales

    alt marquer une notification lue
        Membre->>Notifs: markAsRead(notifId)
        Notifs->>DB: update notifications set is_read = true
    else tout marquer lu
        Membre->>Notifs: markAllAsRead()
        Notifs->>DB: update notifications set is_read = true where user_id = ...
    end

    alt preference DM / parrainage / referent
        Membre->>Settings: toggle
        Settings->>DB: update profiles(accept_dms | accept_sponsorship | accept_referrals)
    else visibilite du profil
        Membre->>Settings: toggle visibilite
        Settings->>DB: update profiles(visibility = json)
    else deconnexion
        Membre->>Settings: handleLogout()
        Settings->>Auth: auth.signOut()
        Settings-->>Membre: redirect /connexion
    end
```

## 3. Administration

Points d'entree et methodes cles:
- `AdminLayout`
- `verifyAdmin()`
- `approveUser()` / `rejectUser()`
- `ApproveRejectButtons.handleAction()`
- `muteUser()` / `unmuteUser()`
- `banFromChat()` / `unbanFromChat()`

### 3.1 Acces admin et validation des candidats

```mermaid
sequenceDiagram
    actor Admin
    participant AdminRoute as UI /admin et /admin/users
    participant Layout as AdminLayout
    participant Actions as Server Actions admin
    participant DB as Supabase DB
    participant Candidate as Candidat en attente

    Admin->>Layout: Ouvre /admin
    Layout->>DB: select profiles(is_admin)
    alt non admin
        Layout-->>Admin: redirect /chat
    else admin
        Layout-->>AdminRoute: acces autorise
    end

    AdminRoute->>DB: select profiles(status = pending)
    AdminRoute->>DB: select profiles(status != pending)
    DB-->>AdminRoute: listes utilisateurs + sponsor

    Admin->>Actions: clique Approuver/Rejeter
    Actions->>DB: verifyAdmin() -> auth.getUser() + select profiles(is_admin, status, onboarding_completed)

    alt admin valide
        Actions->>DB: update profiles(status = approved|rejected)
        Actions-->>AdminRoute: success true
        AdminRoute-->>Admin: router.refresh()
    else refuse
        Actions-->>AdminRoute: success false + error
    end

    Candidate->>Candidate: revisite l'app ou "Verifier mon statut"
    Candidate->>DB: select profiles(status, sponsor_approved)
    alt approuve
        Candidate-->>Candidate: redirect /chat puis /onboarding si necessaire
    else rejete
        Candidate-->>Candidate: etat explicite /en-attente
    end
```

### 3.2 Moderation chat cote serveur

```mermaid
flowchart TD
    A["Action admin UI ou appel futur"] --> B["Server Action admin"]
    B --> C["verifyAdmin()"]
    C --> D{Utilisateur authentifie<br/>et admin approuve/onboarde ?}
    D -- non --> E["Retour erreur Acces refuse"]
    D -- oui --> F{Action}
    F -- mute --> G["update profiles.chat_muted_until"]
    F -- unmute --> H["update profiles.chat_muted_until = null"]
    F -- ban --> I["update profiles.chat_banned = true"]
    F -- unban --> J["update profiles.chat_banned = false"]
    G --> K["Retour success/error"]
    H --> K
    I --> K
    J --> K
```

## Notes de lecture

- Les diagrammes montrent l'architecture actuelle, y compris le lien de mention chat en `/chat?channel=...` dans `notifyMentions()`.
- La frontiere d'acces existe a deux niveaux:
  - middleware global `updateSession()`
  - layouts serveur `(app)` et `admin`
- Le chat combine:
  - prechargement serveur du salon par defaut
  - cache local `chat-store`
  - subscriptions realtime Supabase
  - polling de resynchronisation toutes les 5 secondes
