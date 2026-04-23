<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>YouConnect Invitation</title>
</head>
<body style="margin:0; padding:0; background:#05020d; color:#FFF3DC; font-family: Arial, sans-serif;">
<div style="max-width:640px; margin:0 auto; padding:24px;">
    <div style="border:1px solid rgba(255,255,255,0.12); border-radius:18px; background:rgba(255,255,255,0.04); padding:22px;">
        <h1 style="margin:0 0 12px; font-size:22px; line-height:1.2; color:#FFF3DC;">
            Welcome to YouConnect
        </h1>
        <p style="margin:0 0 16px; color:#d8cfbd; line-height:1.6;">
            Your admin created an account for you. Use these credentials to sign in.
        </p>

        <div style="border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:16px; background:rgba(0,0,0,0.25);">
            <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#25F2A0; font-weight:bold;">
                Login details
            </p>
            <p style="margin:0 0 8px; color:#FFF3DC;">
                <strong>Email:</strong> {{ $user->email }}
            </p>
            <p style="margin:0; color:#FFF3DC;">
                <strong>Temporary password:</strong> {{ $temporaryPassword }}
            </p>
        </div>

        <p style="margin:16px 0 0; color:#d8cfbd; line-height:1.6;">
            Sign in here:
            <a href="{{ config('app.url') }}/sign-in" style="color:#29CFFF; text-decoration:none;">{{ config('app.url') }}/sign-in</a>
        </p>

        <p style="margin:16px 0 0; color:#d8cfbd; line-height:1.6;">
            For security, please change your password after your first login.
        </p>
    </div>

    <p style="margin:18px 0 0; font-size:12px; color:rgba(255,255,255,0.55); line-height:1.6;">
        YouConnect - Community learning workspace
    </p>
</div>
</body>
</html>
