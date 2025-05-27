How to Start the Game
✅ Step 1: Open a Terminal
Option 1 – Using VS Code:

    Open the project folder (e.g., MyFirstApp) in Visual Studio Code.

    Go to the top menu bar: Terminal > New Terminal

    The terminal panel will appear at the bottom.

Option 2 – Using Windows File Explorer:

    Navigate to the project folder (MyFirstApp)

    In the folder, right-click and choose:

        “Open in Terminal” (Windows 11)

        or “Open PowerShell window here” (Windows 10)

✅ Step 2: Install Dependencies

If this is your first time:

npm install

    This installs all the packages listed in package.json.

✅ Step 3: Start the Expo Dev Server

npx expo start

    A QR code will appear in the terminal or browser

    Open Expo Go App on your iPhone

    Scan the QR code to launch the game on your phone

❗ Troubleshooting
🔸 Error: package.json not found

You're in the wrong folder. Make sure you’re in MyFirstApp/ where package.json is located.
🔸 Error: npx.ps1 cannot be loaded...

Run this in PowerShell to allow script execution:
-----------------------------------------------------------
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
-----------------------------------------------------------
Then re-run:

npx expo start

✅ Features

    Tap-based movement with stamina and cooldown

    Step-by-step restriction and scoring

    Red laser scan line with animation

    Custom level maps and endless mode

