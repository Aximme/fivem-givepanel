ESX = exports['es_extended']:getSharedObject()

local discordWebhookURL = "YOUR_DISCORD_WEBHOOK_URL"

local function sendDiscordLog(title, description, color)
    local embed = {
        {
            ["title"] = title,
            ["description"] = description,
            ["color"] = color,
            ["footer"] = {
                ["text"] = os.date("%Y-%m-%d %H:%M:%S", os.time() + 3600)
            }
        }
    }

    PerformHttpRequest(discordWebhookURL, function(err, text, headers) end, 'POST', json.encode({username = "Inventory Logger", embeds = embed}), { ['Content-Type'] = 'application/json' })
end

RegisterCommand('give', function(source, args, rawCommand)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer then
        local playerGroup = xPlayer.getGroup()
        if playerGroup == 'admin' then
            TriggerClientEvent('inventoryui:openNUI', source)
            --sendDiscordLog("NUI Opened", xPlayer.getName() .. " (ID: " .. source .. ") a ouvert le NUI.", 3066993)
        else
            TriggerClientEvent('inventoryui:notify', source, 'Vous n\'avez pas les permissions pour afficher cela.')
            sendDiscordLog("Unauthorized Access", xPlayer.getName() .. " (ID: " .. source .. ") a tenté d'ouvrir le NUI sans permission.", 15158332)
        end
    end
end, false)

ESX.RegisterServerCallback('inventoryui:getItems', function(source, cb)
    local items = {}
    for k, v in pairs(ESX.Items) do
        table.insert(items, v)
    end
    cb(items)
end)

ESX.RegisterServerCallback('inventoryui:getPlayers', function(source, cb)
    local players = {}
    local xPlayers = ESX.GetExtendedPlayers()
    for _, xPlayer in pairs(xPlayers) do
        table.insert(players, { id = xPlayer.source, name = xPlayer.getName() })
    end
    cb(players)
end)

ESX.RegisterServerCallback('inventoryui:getPlayerInventory', function(source, cb, targetPlayer)
    local xPlayer = ESX.GetPlayerFromId(targetPlayer)
    if xPlayer then
        local items = {}
        local playerItems = xPlayer.getInventory()
        
        for k, v in pairs(playerItems) do
            if v.count > 0 then
                table.insert(items, {
                    name = v.name,
                    label = v.label,
                    count = v.count
                })
            end
        end
        
        cb({
            playerName = xPlayer.getName(),
            items = items
        })
    else
        cb(nil)
    end
end)

RegisterServerEvent('inventoryui:giveItem')
AddEventHandler('inventoryui:giveItem', function(itemName, quantity, targetPlayer)
    local xPlayer = ESX.GetPlayerFromId(source)
    local targetXPlayer = ESX.GetPlayerFromId(targetPlayer)

    if targetXPlayer then
        targetXPlayer.addInventoryItem(itemName, quantity)
        TriggerClientEvent('inventoryui:notify', source, 'Item donné avec succès.')
        TriggerClientEvent('inventoryui:notify', targetPlayer, 'Vous avez reçu un item.')
        sendDiscordLog("Item Given", xPlayer.getName() .. " (ID: " .. source .. ") a donné " .. quantity .. "x " .. itemName .. " à " .. targetXPlayer.getName() .. " (ID: " .. targetPlayer .. ").", 3066993)
    else
        TriggerClientEvent('inventoryui:notify', source, 'Joueur introuvable.')
        sendDiscordLog("Item Give Failed", xPlayer.getName() .. " (ID: " .. source .. ") a tenté de donner " .. quantity .. "x " .. itemName .. " à un joueur introuvable (ID: " .. targetPlayer .. ").", 15158332)
    end
end)

RegisterServerEvent('inventoryui:manageInventory')
AddEventHandler('inventoryui:manageInventory', function(action, targetPlayer, itemName, quantity)
    local xPlayer = ESX.GetPlayerFromId(source)
    local targetXPlayer = ESX.GetPlayerFromId(targetPlayer)

    if targetXPlayer then
        if action == 'add' then
            targetXPlayer.addInventoryItem(itemName, quantity)
            TriggerClientEvent('inventoryui:notify', source, 'Item ajouté avec succès.')
            sendDiscordLog("Manage Inventory : Item Added", xPlayer.getName() .. " (ID: " .. source .. ") a ajouté " .. quantity .. "x " .. itemName .. " à " .. targetXPlayer.getName() .. " (ID: " .. targetPlayer .. ").", 3066993)
        elseif action == 'remove' then
            targetXPlayer.removeInventoryItem(itemName, quantity)
            TriggerClientEvent('inventoryui:notify', source, 'Item supprimé avec succès.')
            sendDiscordLog("Manage Inventory : Item Removed", xPlayer.getName() .. " (ID: " .. source .. ") a supprimé " .. quantity .. "x " .. itemName .. " de " .. targetXPlayer.getName() .. " (ID: " .. targetPlayer .. ").", 15105570)
        end
    else
        TriggerClientEvent('inventoryui:notify', source, 'Joueur introuvable.')
        sendDiscordLog("Inventory Management Failed", xPlayer.getName() .. " (ID: " .. source .. ") a tenté de gérer l'inventaire d'un joueur introuvable (ID: " .. targetPlayer .. ").", 15158332)
    end
end)