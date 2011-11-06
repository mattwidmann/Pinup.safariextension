safari.self.addEventListener('message', respondToMessage, false)

function respondToMessage (event) {
    if (event.name !== 'updateDescription') return

    var description = window.getSelection().toString()

    if (description !== '') event.target.tab.dispatchMessage('descriptionForTab', description)
}
