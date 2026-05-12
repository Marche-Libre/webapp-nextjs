# Diagnostic auth mobile

## Symptome

L'authentification fonctionne sur desktop, mais echoue sur mobile. Le flux OAuth X semble revenir vers l'application sans session active, ou ramene l'utilisateur vers l'entree d'acces.

## Constat dans le code

Le flux d'auth est le meme sur desktop et mobile :

- `src/components/auth/oauth-buttons.tsx` lance `supabase.auth.signInWithOAuth()`.
- `src/lib/auth-url.ts` construit l'URL de callback via `getAuthCallbackUrl()`.
- `src/app/auth/callback/route.ts` appelle `exchangeCodeForSession(code)`, ecrit les cookies Supabase sur la reponse finale, puis redirige vers `/chat`, `/onboarding` ou `/en-attente`.
- `src/lib/supabase/middleware.ts` laisse passer `/auth/*`, puis protege les routes app selon la session et le profil.

Le point fragile est `src/lib/auth-url.ts` : cote navigateur, `getPublicSiteOrigin()` renvoie toujours `window.location.origin`.

## Cause probable

Sur mobile, l'origine utilisee peut differer de l'origine attendue ou autorisee :

- IP locale comme `http://192.168.x.x:3000`
- domaine Vercel preview
- variante `www` vs non-`www`
- navigateur integre ouvert par X
- PWA ou webview qui ne partage pas le meme contexte de stockage que le navigateur initial

Dans ce cas, `redirectTo` devient cette origine + `/auth/callback`. Si cette URL n'est pas autorisee dans Supabase Auth et/ou dans la configuration OAuth X, ou si le retour se fait dans un autre contexte navigateur, l'echange PKCE peut echouer.

Aujourd'hui, l'erreur est peu visible : si `exchangeCodeForSession(code)` echoue dans `src/app/auth/callback/route.ts`, le code redirige simplement vers `/connexion`, ce qui revient au modal d'acces. L'erreur reelle est donc masquee.

## Correctif cible

Modifier `getPublicSiteOrigin()` pour utiliser `window.location.origin` seulement en contexte local :

- `localhost`
- `127.0.0.1`
- eventuellement une IP LAN en developpement

En production, utiliser `NEXT_PUBLIC_SITE_URL` comme origine canonique pour OAuth.

Ajouter aussi un diagnostic minimal dans `/auth/callback` :

- log serveur de l'erreur `exchangeCodeForSession`
- eventuellement redirection avec un parametre d'erreur non sensible, par exemple `/?auth=access&error=oauth_callback`

## Verification

Tester au moins ces cas :

- desktop sur domaine canonique
- mobile Safari/Chrome sur domaine canonique
- retour depuis l'app X ou navigateur integre
- environnement local desktop
- environnement local mobile via IP LAN, si supporte explicitement

Verifier dans Supabase Auth et X que toutes les URLs de callback autorisees correspondent exactement aux origines attendues.
