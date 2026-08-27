# Dashboard

This is a simple desktop application built using Tauri + Sveltekit.

It monitors your cpu usage, ram usage, and cpu temperature. This helps ensure the CPU is not overheating, and helps diagnose performance issues.

It stores this information in a 100-frame buffer, to prevent excess memory usage. Min/Max values are also stored, for the lifetime of the app.


# To run:

download 'dmg/dashboard_0.1.0_x64.dmg'

install like a typical mac app

double-click and run.



# To develop:

cd into the folder

'npm install'

'npm run tauri dev'


You may need to install Rust, specifically if you get an error message like 'failed to run "cargo metadata" command to get workspace directory ... No such file or directory

in that case, install Rust via:

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

and restart the terminal window.

Then you can 'npm run tauri dev' again


To quit:
ctrl+c

