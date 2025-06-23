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
- [X] Refocus the game window if it minimizes unexpectedly
- [X] Remotely shut down the computer (only if the owner is away or explicitly allows it)
- [X] Remotely execute any commands on the computer (for BOT owner only)
- [X] Notify when the computer isn't plugged in, the battery is low, temperature is high or a driver error, requiring physical intervention
- [X] Check the connection between the user and computer through Steam Remote Play (experimental, may not work on some devices)
- [X] [LocalStorage/Config folder separation support for each user](#localstorageconfig-data-separation-support)
- [X] [Assigning different Steam account for each Discord user](#assigning-a-different-steam-account-for-each-user)

> [!NOTE]
> Any changes with computer settings (physical input lock, brightness, volume, etc.) will be back to normal after restarting the computer. So if you encounter any errors when using the BOT, you just need to restart the computer.

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

* Clone this BOT using this command below or [download the latest source code](../../archive/refs/heads/main.zip).

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

* Copy the `.env.sample` file to a new one and rename it to `.env`, then edit the file and specify the token with the `TOKEN` variable.

* Copy the `config.sample` folder into a new one, and rename it to `config`. After that, config the BOT yourself to your liking based on the instructions below.

You can view the example of all configurations in the `config.sample` folder.

#### `config/main.json`

Contains the main BOT configuration.

| Property | Type | Description |
| --- | --- | --- |
| language | `string` | BOT language. Make sure that `strings/${language}.json` exists in the BOT folder. |
| owner_id | `string` | BOT owner's Discord ID. |
| prefix | `string` | BOT prefix for message content based commands. |
| whitelist | `object` | An object with each property as the user ID (key) paired with the Steam account (value), for example `{"693107293516070944": "nicolevianth"}`. See [`config.sample/main.json`](config.sample/main.json) for example. |

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
| evtest_on_x11 | `boolean` | Use `evtest` instead of `xinput --disable` to lock the physical input on X11. This way is more stable than xinput but it will require root access. |
| lock_timer | `boolean` | If `true`, the BOT will rerun the physical input lock/set brightness commands each 10 seconds to further prevent external interference. |

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
| command | `object` | An object with each property containing the target Steam account (key) with assigned start command (value), for example `{"default": "/home/murasame/StartGenshin.sh"}`. Use `default` to assign the default command. See [`config.sample/whitelisted_apps.json`](config.sample/whitelisted_apps.json) for more information. |
| screenshot | `string` | In-game screenshot folder to be monitored. Leave empty if not supported. |
| localStorage | `string` | The game's LocalStorage/config folder for separating by Steam account username. See [LocalStorage/Config data separation support](#localstorageconfig-data-separation-support) for more information. |
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

```sh
npm start
```

#### Enable further debugging

You can enable further debugging logs that contain all of the command the BOT uses to run by running one of these commands below instead of `npm start`. Remember that further debugging can output some personal information, and you should be cautious when running it in public.

This is also required when reporting an issue related to the BOT.

For writing the logs directly to the console window, run this command:

```sh
npm run debug
```

For writing the logs to `journal` (useful for debugging serious crashes):

```sh
npm run debug_journal
```

#### Running Katheryne as root (not recommended)

```sh
sudo -E npm start
```

#### Autostart

You can of course use your Desktop Environment's Autostart settings (or `.config/autostart`) to start Katheryne automatically after boot.

`pm2` is not recommended in my opinion due to it invoking the BOT before starting the DE, so it may cause some unwanted issues.

### Special features

These are advanced features that require additional understanding and specific command arguments.

#### Assigning a different Steam account for each user

> [!IMPORTANT]
> You must log in to all assigned Steam accounts **before** running the BOT. If an account isn't logged in, Steam will prompt for login when a user runs the `steam` command!
>
> Don't worry — users won't be able to switch to any account other than the one assigned to them, as long as Steam is started using the specified command (`steam -user ${username}`). The BOT handles this automatically.

When a different Discord user runs the `steam` command, the BOT can launch Steam using a specific account assigned to that user. To enable this, you need to map each Discord user ID to a Steam account in the configuration.

For example, to assign the `nicolevianth` Steam account to user ID `693107293516070944` (this is my Discord ID!), edit your `config/main.json` file like this:

```json
{
    "language": "en",
    "owner_id": "693107293516070944",
    "prefix": "!",
    "whitelist": {
        "693107293516070944": "nicolevianth" // <---- This!
    }
}
```

Only users listed in the `whitelist` object can use the BOT. If you don’t want to assign a specific Steam account to a user, leave the value empty. The BOT will fall back to using the default Steam account defined in `config/steam.json`.

#### LocalStorage/Config data separation support

> [!IMPORTANT]
> Because the BOT separates data by Steam account username, **you must assign a Steam account to each Discord user** (even if they don’t use Steam directly).
>
> You need to specify the correct folder that switches the user account when its contents are different (that will require some research from yourself).

Some games store user data and settings in a shared folder within the game directory — even if you use separate Wine prefixes, which can prevent user-specific login information from being properly applied.

To make switching between accounts seamless for users, the BOT allows you to isolate the `LocalStorage` or any config folder for each account.

- Define the target config folder using the `localStorage` property for each whitelisted app in `config/whitelisted_apps.json`. For example:

```json
{
    "process": "GenshinImpact.exe",
    "name": "Genshin Impact",
    "alias": "genshin",
    "command": {
        "default": "/home/murasame/StartGenshin.sh"
    },
    "screenshot": "/mnt/GenshinImpact/ScreenShot",
    "localStorage": "/mnt/GenshinImpact/GenshinImpact_Data/SDKCaches/HoYoPass", // <---- This!
    "channel": "1191968934635774034"
}
```

- When a user starts a game using the `steam` or `start` command, the BOT:
  1. Backs up the current contents of the specified folder to `database/${alias}_localStorage_.tar`.
  2. Extracts the user-specific `database/${alias}_localStorage_${steamUsername}.tar` file to that folder.

> [!NOTE]
> If the user has no previously backed-up data, the BOT will first copy the original folder. The user can then log in to their account and the game will modify the contents, which will subsequently be backed up separately as usual.

- When the session ends (via `exit`, `steam exit`, or `shutdown`), the BOT:
  1. Backs up the current folder contents to the user-specific `.tar` file.
  2. Restores the original data from `database/${alias}_localStorage_.tar`, returning the game to the computer owner’s default configuration.

#### Starting a session on behalf of another user

> [!NOTE]
> This feature is available to BOT (computer) owners only.

Sometimes users may not know how to use the BOT, or you may want to launch a session for them manually.

- Copy the user's Discord ID, then run the `steam ${discordID}` or `start ${alias} ${discordID}` command with that copied Discord ID. For example:
  
```
!steam 693107293516070944

or

!start genshin 693107293516070944
```

- The BOT will reply with something like:
  
```
Starting with s1432_nbhz's specified information.
```

- The BOT will use the user's assigned Steam account and other relevant settings. That user will also be granted the permission to stop the session or shut down the system, as if they started the session themselves.

> [!TIP]
> You can also use `steam ${steamUsername}` or `start ${alias} ${steamUsername}` to start a session with a specific Steam account, even without a linked Discord account. However, only you (the owner) will be able to stop the session or shut down the computer in that case.

#### Permissive mode

Add the `-permissive` argument to the startup command to allow **all whitelisted users** to stop the session. This is useful when a session is shared among multiple users.

## Known issues

I'm not a skilled Linux expert, so issues are unable to avoid. These are the known issues that I've experienced myself, and I'm not sure if these also work for you.

### Computer crashes after starting game while BOT is running

Try setting `high_temperature` in `config/logging.json` to `false` to disable high temperature warning. This logging may cause crashes on some devices and requires a force restart.

### Game crashes when locking/unlocking physical inputs on X11

The `xinput` commands used on X11 can be unstable on some devices, therefore it crashes the game when executing.

Try setting `evtest_on_x11` in `config/computer.json` to let the lock/unlock commands use `evtest` instead of `xinput`. It's more stable but it will require root permissions.

### Original LocalStorage/Config data won’t be restored if shutdown without using Katheryne

This issue cannot be fully resolved since Katheryne cannot interact with the system during a shutdown unless the `shutdown` command is used.

To work around this, you’ll need to create a shutdown hook script that extracts the `${alias}_localStorage_.tar` files back into their respective LocalStorage/Config folders before the system powers off.

## License

This BOT is licensed under the **MIT License**. You are free to use, modify, and distribute it, including for commercial purposes.
