# Aximme Inventory Manager 🎒

Aximme Inventory Manager is a FiveM script that provides a NUI (New User Interface) for managing player inventories. This script allows administrators to give items to players, manage player inventories, and log actions to a Discord channel.

## Features ✨

- **NUI Interface**: A user-friendly interface for managing player inventories.
- **Item Management**: Add or remove items from player inventories.
- **Player Selection**: Select players to give items to or manage their inventories.
- **Discord Logging**: Log actions such as giving items or unauthorized access attempts to a Discord channel.

## Requirements 📋

- [ESX](https://github.com/esx-framework/es_extended)
- [oxmysql](https://github.com/overextended/oxmysql)
- [ox_inventory](https://github.com/overextended/ox_inventory)

## Installation 🛠️

1. **Clone the repository:**
    ```sh
    git clone https://github.com/Aximme/fivem-givepanel.git
    ```

2. **Navigate to the resource folder:**
    ```sh
    cd aximme_inventory_manager
    ```

3. **Add the resource to your `server.cfg`:**
    ```cfg
    ensure aximme_inventory_manager
    ```

4. **Configure the Discord webhook URL in `server.lua`:**
    ```lua
    local discordWebhookURL = "YOUR_DISCORD_WEBHOOK_URL"
    ```

## Usage 🚀

### Commands

- **/give**: Opens the NUI for administrators to manage player inventories.

### NUI

- **Give Items**: Search for items and give them to selected players.
- **Manage Inventories**: View and manage the inventories of selected players.

## Configuration ⚙️

### Discord Logging

The script logs actions to a Discord channel using webhooks. Configure the webhook URL in `server.lua`:

```lua
local discordWebhookURL = "YOUR_DISCORD_WEBHOOK_URL"
```

### Permissions
Only administrators (in database [table users]) can open the NUI using the /give command. The script checks the player's group and logs unauthorized access attempts.

## Contributing 🤝
Feel free to submit issues or pull requests if you have any improvements or bug fixes.

## License 📄
This project is licensed under the MIT License. See the LICENSE file for details.
