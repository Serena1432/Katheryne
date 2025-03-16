# Katheryne

**Katheryne** is a work-in-progress Discord BOT designed for remote gameplay, computer management, and connectivity via Discord.

Currently, it only supports Linux, with both X11 and Wayland compatibility. KDE Plasma is recommended since it's my development environment.

## Disclaimer

This BOT prioritizes simplicity and convenience over security and is intended for personal or small-scale use (e.g., providing a "cloud computer" for friends or remotely managing your own device). **It is not suitable for large public servers, as I cannot guarantee security at scale.**

Only grant permissions to trusted individuals. **USE THIS PROGRAM AT YOUR OWN RISK. I am not responsible for any damage resulting from its use.**

## Purpose

I originally created this BOT in 2023 to let my friends easily connect to my computer and use features remotely without relying on traditional remote control applications. It also allows me to manage my own computer while away.

The initial implementation worked well, but I lost the original code recently. To prevent this from happening again, I decided to rebuild it and make it open-source.

## Support

Katheryne works best with **KDE Plasma 6 on Linux** but is compatible with any distribution using X11 or Wayland.

Intel CPUs + NVIDIA GPUs are also recommended. I haven't tested AMD CPUs/GPUs, so be prepared for potential issues.

### Supported Remote Play Applications

✅ Steam Link / Remote Play (official support)<br>
⚠️ Moonlight and other tools can be launched via remote execution but are **not officially supported**—you have to run the commands manually.<br>
❌ Parsec is not supported (no Linux hosting support).

## Features

These features can be used directly in a Discord server, provided you have the required permissions:

- [X] Run whitelisted applications remotely using commands/built-in integrations
- [X] Take screenshots and monitor system stats
- [X] Auto-send in-game screenshots to a Discord channel
- [X] Lock the physical keyboard/mouse to prevent interference (I made that as my kids usually interrupt gameplay when my friends are playing)
- [X] Turn off the physical display and mute audio (for the same reason as above)
- [X] Send notifications (on-screen messages) to the computer from Discord
- [ ] Refocus the game window if it minimizes unexpectedly
- [ ] Remotely shut down the computer (only if the owner is away or explicitly allows it)
- [ ] Notify when the computer isn't plugged in, the battery is low or a driver error, requiring physical intervention

* **Note:** Any changes with computer settings (physical input lock, brightness, volume, etc.) will be restored after restarting the computer. So if you encounter any errors when using the BOT, you just need to restart the computer.

### Commands coverage

| Feature | X11 | Wayland | Intel | NVIDIA |
| --- | --- | --- | --- | --- |
| Take screenshots | ✅ | ⭕ | ✅ | ✅ |
| View computer stats | ✅ | ✅ | 🔴| ✅ |
| Lock/disable physical input | ✅ | 🔴 | ❓ | ❓ |
| Change screen brightness | 🔴 | 🔴 | 🔴 | ⭕ |
| Mute the host audio | ✅ | ✅ | ✅ | ⭕ |
| Refocus the game window | ✅ | ❌ | ❓ | ❓ |
| Remotely shutdown the computer | 🔴 | 🔴 | ❓ | ❓ |
| Set the fan speed | ❓ | ❓ | 🔴 | 🔴 |
| Set the CPU governor | 🔴 | 🔴 | 🔴 | ❓ |
| Check the running process | ✅ | ✅ | ❓ | ❓ |

✅ Fully supported without root permissions<br>
🔴 Supported but requires root permissions<br>
⭕ Supported but not tested<br>
❌ Totally not supported<br>
❓ Not related

Currently, AMD CPUs/GPUs are not properly supported as I don't have any AMD computers.

*To protect privacy, some features will only be available when a **whitelisted game/application is running**.*

### Running root commands

To run commands that require root permissions, you can do one of these ways below:

* Running the BOT with `sudo` permissions
* Grant the permissions for specific commands used by the BOT
* Or don't use these commands at all

## Required applications

### General

* brightnessctl (for brightness control)
* scrot (for X11 screenshot)
* wmctrl (for X11 window focusing)
* nbfc-linux (for fan control)
* libinput-tools (for input devices management)
* evtest (for Wayland physical input locking)
* rfkill (for enabling/disabling Bluetooth)

### Taking screenshots in Wayland

* gnome-screenshot (for GNOME-based desktop environments)
* spectacle (for KDE Plasma)
* grim (for other desktop environments)

### Intel GPUs

* intel-gpu-tools

## Installation

Coming soon...

## License

This BOT is licensed under the **MIT License**. You are free to use, modify, and distribute it, including for commercial purposes.
