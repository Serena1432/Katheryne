# Katheryne

**Katheryne** is a work-in-progress Discord BOT designed for remote gameplay, computer management, and connectivity via Discord.

Currently, it only supports Linux, with both X11 and Wayland compatibility. KDE Plasma is recommended since it's my development environment.

## Table of Contents

- [Katheryne](#katheryne)
  - [Disclaimer](#disclaimer)
  - [Purpose](#purpose)
  - [Support](#support)
    - [Supported Remote Play Applications](#supported-remote-play-applications)
  - [Features](#features)
    - [Commands coverage](#commands-coverage)
  - [Running root commands](#running-root-commands)
    - [List of root commands](#list-of-root-commands)
  - [Required applications](#required-applications)
    - [General](#general)
    - [Taking screenshots in Wayland](#taking-screenshots-in-wayland)
    - [Intel GPUs](#intel-gpus)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Configuration](#configuration)
      - [`config/main.json`](#configmainjson)
      - [`config/computer.json`](#configcomputerjson)
      - [`config/steam.json`](#configsteamjson)
      - [`config/whitelisted_apps.json`](#configwhitelisted_appsjson)
      - [`config/logging.json`](#configloggingjson)
    - [Starting](#starting)
      - [Running Katheryne as normal user](#running-katheryne-as-normal-user)
      - [Running Katheryne as root (not recommended)](#running-katheryne-as-root-not-recommended)
      - [Autostart](#autostart)
  - [License](#license)

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
- [X] Refocus the game window if it minimizes unexpectedly
- [X] Remotely shut down the computer (only if the owner is away or explicitly allows it)
- [X] Remotely execute any commands on the computer (for BOT owner only)
- [X] Notify when the computer isn't plugged in, the battery is low, temperature is high or a driver error, requiring physical intervention
- [X] Check the connection between the user and computer through Steam Remote Play (experimental, may not work on some devices)

**Note:** Any changes with computer settings (physical input lock, brightness, volume, etc.) will be back to normal after restarting the computer. So if you encounter any errors when using the BOT, you just need to restart the computer.

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

* Grant the permissions for specific commands used by the BOT (recommended)
* Running the BOT with `sudo` permissions
    * Using this way may cause some unexpected errors, proceed at your own risk.
    * Steam and some games will have some glitches, and tends to have a higher ping when Katheryne is running as root (idk why but it's what it is)
* Or don't use these commands at all

#### List of root commands

This is the list of commands requiring root permissions:

* **Intel GPU stats:**<br>`intel_gpu_top`
* **Set display brightness:**<br>`brightnessctl set ${pc}%`
* **Set CPU governor:**<br>`echo "${governor}" | tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor`
* **Set fan speed:**<br>`nbfc set -s ${pc}`
* **Physical input locking (Wayland):**<br>`evtest --grab /dev/input/event${id} >/dev/null`
* **Physical input device listing (Wayland):**<br>`libinput list-devices`

For security reasons, you have to find a way to allow these commands for your user by yourself.

## Required applications

### General

* `brightnessctl` (for brightness control)
* `scrot` (for X11 screenshot)
* `wmctrl` (for X11 window focusing)
* `nbfc-linux` (for fan control)
* `libinput-tools` (for input devices management)
* `evtest` (for Wayland physical input locking)
* `rfkill` (for enabling/disabling Bluetooth)

### Taking screenshots in Wayland

* `gnome-screenshot` (for GNOME-based desktop environments)
* `spectacle` (for KDE Plasma)
* `grim` (for other desktop environments)

### Intel GPUs

* `intel-gpu-tools`

## Usage

### Installation

* Clone this BOT using this command below or [download the latest source code](./archive/refs/heads/main.zip).

```sh
git clone https://github.com/Serena1432/Katheryne.git
```

* Change the current directory to the source folder:

```sh
cd Katheryne
```

* Install all the dependencies:

```sh
npm install
```

* Install all required applications listed in the **Required applications** section above, depends on your distro and your need.

### Configuration

* Copy the `.env` file to a new one and rename it to `.env`, then edit the file and specify the token with the `TOKEN` variable.

* Copy the `config.sample` folder into a new one, and rename it to `config`. After that, config the BOT yourself to your liking based on the instructions below.

You can view the example of all configurations in the `config.sample` folder.

#### `config/main.json`

Contains the main BOT configuration.

| Property | Type | Description |
| --- | --- | --- |
| language | `string` | BOT language. Make sure that `strings/${language}.json` exists in the BOT folder. |
| owner_id | `string` | BOT owner's Discord ID. |
| prefix | `string` | BOT prefix for message content based commands. |
| whitelist | `string[]` | List of Discord ID allowed to use the BOT. |

#### `config/computer.json`

Contains the computer configuration.

| Property | Type | Description |
| --- | --- | --- |
| close_processes | `string[]` | List of processes to be closed upon starting an application. |
| start_processes | `string[]` | List of processes to be started after exitting applications. |
| auto_mute | `boolean` | Automatically mute the physical speakers upon starting. |
| auto_bluetooth_off | `boolean` | Automatically turn off Bluetooth upon starting. |
| auto_performance_governor | `boolean` | Automatically set the CPU govenor to `performance` upon starting. |
| auto_max_fan_speed | `boolean` | Automatically set the fan speed to maximum upon starting. |
| auto_lock_input | `boolean` | Automatically lock the physical inputs upon starting. |

#### `config/steam.json`

Contains the Steam configuration.

| Property | Type | Description |
| --- | --- | --- |
| default_user | `string` | Default Steam user to be logged in when using the `steam` command. Leave empty to manually select the user upon starting. |
| wayland_enable_pipewire | `boolean` | Enable PipeWire screen capture when connecting to Steam Remote Play on Wayland. |
| detach | `boolean` | If `true`, Steam will keep running even when the BOT stops working. |

#### `config/whitelisted_apps.json`

Contains a list of whitelisted apps for all users to run anytime they want.

Is a JSON array containing objects with these properties:

| Property | Type | Description |
| --- | --- | --- |
| process | `string` | Process name (will be used to detect if the app is running or not) |
| name | `string` | Display name to be displayed in the BOT status and statistics |
| alias | `string` | Shortened alias for members to use with the `start` command |
| command | `string` | Command to be executed after using the start command |
| screenshot | `string` | In-game screenshot folder to be monitored. Leave empty if not supported. |
| channel | `string` | Discord channel ID for in-game screenshots. Unused if `screenshot` isn't set. |

#### `config/logging.json`

Contains the logging configuration.

| Property | Type | Description |
| --- | --- | --- |
| log_channel | `string` | Discord channel ID to receive logs. Leave empty if you don't want logging. |
| steam_connection | `string` | Whether to send a log when there's a new Steam Remote Play connection. |
| high_temperature | `string` | Whether to send a log when the computer temperature is high. |
| low_battery | `string` | Whether to send a log when the computer battery is low. |

### Starting

#### Running Katheryne as normal user

```
npm start
```

#### Running Katheryne as root (not recommended)

```
sudo -E npm start
```

### Autostart

You can of course use your Desktop Environment's Autostart settings (or `.config/autostart`) to start Katheryne automatically after boot.

`pm2` is not recommended in my opinion due to it invoking the BOT before starting the DE, so it may cause some unwanted issues.

## License

This BOT is licensed under the **MIT License**. You are free to use, modify, and distribute it, including for commercial purposes.
