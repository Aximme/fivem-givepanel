fx_version 'cerulean'
game 'gta5'

author 'Aximme'
description 'Gestionnaire d\'inventaire NUI'

client_scripts {
    'client.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua', -- Si vous utilisez oxmysql
    '@es_extended/locale.lua',
    'server.lua',
}

ui_page 'html/index.html'

dependencies {
    'ox_inventory',
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/images/*.png', -- Les images des items
    'html/images/no-item.png', -- Image par défaut
}