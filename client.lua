ESX = exports['es_extended']:getSharedObject()

Citizen.CreateThread(function()
    while ESX == nil do
        TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
        Citizen.Wait(0)
    end
end)

local isUIOpen = false

RegisterNetEvent('inventoryui:openNUI')
AddEventHandler('inventoryui:openNUI', function()
    if not isUIOpen then
        SetNuiFocus(true, true)
        SendNUIMessage({ action = 'open' })
        isUIOpen = true
    else
        ESX.ShowNotification('L\'interface est déjà ouverte.')
    end
end)

RegisterNUICallback('close', function(data, cb)
    SetNuiFocus(false, false)
    isUIOpen = false
    cb('ok')
end)

RegisterNUICallback('getItems', function(data, cb)
    ESX.TriggerServerCallback('inventoryui:getItems', function(items)
        cb(items)
    end)
end)

RegisterNUICallback('getPlayers', function(data, cb)
    ESX.TriggerServerCallback('inventoryui:getPlayers', function(players)
        cb(players)
    end)
end)

RegisterNUICallback('getPlayerInventory', function(data, cb)
    local targetPlayer = data.playerId
    ESX.TriggerServerCallback('inventoryui:getPlayerInventory', function(inventory)
        cb(inventory)
    end, targetPlayer)
end)

RegisterNUICallback('giveItem', function(data, cb)
    local itemName = data.itemName
    local quantity = tonumber(data.quantity)
    local targetPlayer = data.targetPlayer

    TriggerServerEvent('inventoryui:giveItem', itemName, quantity, targetPlayer)
    cb('ok')
end)

RegisterNUICallback('manageInventory', function(data, cb)
    local action = data.action
    local targetPlayer = data.targetPlayer
    local itemName = data.itemName
    local quantity = tonumber(data.quantity)

    TriggerServerEvent('inventoryui:manageInventory', action, targetPlayer, itemName, quantity)
    cb('ok')
end)

RegisterNetEvent('inventoryui:notify')
AddEventHandler('inventoryui:notify', function(message)
    ESX.ShowNotification(message)
end)