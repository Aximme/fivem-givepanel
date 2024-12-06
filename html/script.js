window.addEventListener('message', function(event) {
    if (event.data.action === 'open') {
        openNUI();
    }
});

document.getElementById('close-btn').addEventListener('click', function() {
    fetch(`https://${GetParentResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(() => {
        document.getElementById('inventory-ui').style.display = 'none';
    });
});

function openNUI() {
    document.getElementById('inventory-ui').style.display = 'block';
    loadItems();
}

const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabLinks.forEach(function(link) {
    link.addEventListener('click', function() {
        tabLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(link.getAttribute('data-tab')).classList.add('active');
        if (link.getAttribute('data-tab') === 'donner-items') {
            loadItems();
        } else {
            loadPlayers();
        }
    });
});

function loadItems() {
    fetch(`https://${GetParentResourceName()}/getItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(response => response.json()).then(items => {
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = '';
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.innerHTML = `
                <img src="nui://ox_inventory/web/images/${item.name}.png" alt="${item.label}" onerror="this.onerror=null;this.src='nui://ox_inventory/web/images/no-item.png';">
                <span>${item.label}</span>
            `;
            itemDiv.addEventListener('click', () => {
                showQuantityPopup(item.label, (quantity) => {
                    selectPlayerForItem(item.name, quantity);
                });
            });
            itemsList.appendChild(itemDiv);
        });
    });
}

function selectPlayerForItem(itemName, quantity) {
    fetch(`https://${GetParentResourceName()}/getPlayers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(response => response.json()).then(players => {
        showPlayerSelectionPopup(players, (playerId) => {
            fetch(`https://${GetParentResourceName()}/giveItem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemName, quantity, targetPlayer: playerId })
            }).then(() => {
                showPopup('Item donné avec succès.');
                fetch(`https://${GetParentResourceName()}/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Item donné avec succès.' })
                });
            }).catch(() => {
                showPopup('Erreur lors du don de l\'item.');
                fetch(`https://${GetParentResourceName()}/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Erreur lors du don de l\'item.' })
                });
            });
        });
    });
}

function loadPlayers() {
    fetch(`https://${GetParentResourceName()}/getPlayers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    }).then(response => response.json()).then(players => {
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.innerHTML = `
                <span>${player.name} (ID: ${player.id})</span>
            `;
            playerDiv.addEventListener('click', () => {
                managePlayerInventory(player.id);
            });
            playersList.appendChild(playerDiv);
        });
    });
}

function managePlayerInventory(playerId) {
    fetch(`https://${GetParentResourceName()}/getPlayerInventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
    }).then(response => response.json()).then(inventory => {
        if (inventory && inventory.items) {
            const inventoryDiv = document.createElement('div');
            inventoryDiv.innerHTML = `
                <h3>Inventaire de ${inventory.playerName}</h3>
                <div id="player-inventory"></div>
            `;
            document.getElementById('players-list').innerHTML = '';
            document.getElementById('players-list').appendChild(inventoryDiv);
            const playerInventory = document.getElementById('player-inventory');

            if (Array.isArray(inventory.items) && inventory.items.length > 0) {
                inventory.items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item');
                    itemDiv.innerHTML = `
                        <img src="nui://ox_inventory/web/images/${item.name}.png" alt="${item.label}" onerror="this.onerror=null;this.src='nui://ox_inventory/web/images/no-item.png';">
                        <span>${item.label} x${item.count}</span>
                        <input type="number" id="quantity-${item.name}" placeholder="Quantité">
                        <button onclick="manageItem('${playerId}', '${item.name}', 'add')">Ajouter</button>
                        <button onclick="manageItem('${playerId}', '${item.name}', 'remove')">Supprimer</button>
                    `;
                    playerInventory.appendChild(itemDiv);
                });
            } else {
                showPopup('Aucun item trouvé dans l\'inventaire.');
                fetch(`https://${GetParentResourceName()}/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Aucun item trouvé dans l\'inventaire.' })
                });
            }
        } else {
            showPopup('Impossible de charger l\'inventaire du joueur.');
            fetch(`https://${GetParentResourceName()}/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Impossible de charger l\'inventaire du joueur.' })
            });
        }
    }).catch(error => {
        console.error('Erreur lors de la récupération de l\'inventaire:', error);
    });
}


function manageItem(playerId, itemName, action) {
    const quantityInput = document.getElementById(`quantity-${itemName}`);
    const quantity = quantityInput.value;
    if (quantity) {
        fetch(`https://${GetParentResourceName()}/manageInventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, targetPlayer: playerId, itemName, quantity })
        }).then(() => {
            managePlayerInventory(playerId);
        });
    } else {
        showPopup('Veuillez saisir une quantité.');
        emit('ox_inventory:notify', 'Veuillez saisir une quantité.');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        fetch(`https://${GetParentResourceName()}/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        }).then(() => {
            document.getElementById('inventory-ui').style.display = 'none';
        });
    }
});

function showPopup(message) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function showQuantityPopup(itemLabel, callback) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h3>Combien de ${itemLabel} voulez-vous donner ?</h3>
            <input type="number" id="quantity-input" placeholder="Quantité">
            <button id="confirm-btn">Confirmer</button>
            <button id="cancel-btn">Annuler</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('confirm-btn').addEventListener('click', () => {
        const quantity = document.getElementById('quantity-input').value;
        if (quantity) {
            callback(quantity);
            popup.remove();
        } else {
            showPopup('Veuillez saisir une quantité.');
        }
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
        popup.remove();
    });
}

function showPlayerSelectionPopup(players, callback) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h3>Sélectionner un joueur</h3>
            <input type="text" id="player-search" placeholder="Rechercher un joueur...">
            <div id="popup-players-list"></div>
            <button id="close-popup-btn">Fermer</button>
        </div>
    `;
    document.body.appendChild(popup);

    const playersList = document.getElementById('popup-players-list');
    const playerSearch = document.getElementById('player-search');

    function updatePlayerList(filteredPlayers) {
        playersList.innerHTML = '';
        filteredPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('player');
            playerDiv.innerHTML = `
                <span>${player.name} (ID: ${player.id})</span>
            `;
            playerDiv.addEventListener('click', () => {
                callback(player.id);
                popup.remove();
            });
            playersList.appendChild(playerDiv);
        });
    }

    playerSearch.addEventListener('input', () => {
        const searchTerm = playerSearch.value.toLowerCase();
        const filteredPlayers = players.filter(player => 
            player.name.toLowerCase().includes(searchTerm) || 
            player.id.toString().includes(searchTerm)
        );
        updatePlayerList(filteredPlayers);
    });

    updatePlayerList(players);

    document.getElementById('close-popup-btn').addEventListener('click', () => {
        popup.remove();
    });
}

document.getElementById('search-items').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('#items-list .item');
    items.forEach(item => {
        const itemLabel = item.querySelector('span').textContent.toLowerCase();
        item.style.display = itemLabel.includes(searchTerm) ? 'flex' : 'none';
    });
});

document.getElementById('search-players').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const players = document.querySelectorAll('#players-list .player');
    players.forEach(player => {
        const playerName = player.querySelector('span').textContent.toLowerCase();
        player.style.display = playerName.includes(searchTerm) ? 'flex' : 'none';
    });
});