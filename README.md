# Dashboard

This is a simple desktop application built using Tauri + Sveltekit.

It monitors your cpu usage, ram usage, and cpu temperature. This helps ensure the CPU is not overheating, and helps diagnose performance issues.

It stores this information in a 100-frame buffer, to prevent excess memory usage. Min/Max values are also stored, for the lifetime of the app.


# To run:

Download
cd into the folder
'npm install'
'npm run tauri dev'

To quit:
ctrl+c

