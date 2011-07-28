safari.application.addEventListener("command", commandHandler, false)

function commandHandler (event) {
}

safari.application.addEventListener("validate", validateHandler, false)

function validateHandler (event) {
    //if (event.command !== 'popover') return

    safari.extension.popovers[0].contentWindow.log(safari.extension.settings.username)
    event.target.disabled = !event.target.browserWindow.activeTab.url
}
