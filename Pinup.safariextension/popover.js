safari.application.addEventListener('popover', popoverHandler, false)

function popoverHandler (event) {
    var url = safari.application.activeBrowserWindow.activeTab.url
    var title = safari.application.activeBrowserWindow.activeTab.title

    document.bookmark.url.value = url
    document.bookmark.title.value = title
    document.bookmark.description.value = ''
    document.bookmark.tags.value = ''
    document.bookmark.private.checked = true

    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updateDescription')

    var api = pinboardEndpoint('/posts/get/', url)

    sendRequest(api, function (response) {
        var json = JSON.parse(cleanPinboardJSON(response.responseText))

        if (json.posts.length != 2) {
            document.bookmark.add.value = 'Add to Pinboard'

            return
        }

        document.bookmark.add.value = 'Edit Bookmark'
        document.bookmark.title.value = json.posts[0].description
        document.bookmark.description.value = json.posts[0].extended
        document.bookmark.tags.value = json.posts[0].tags
        document.bookmark.private.checked = !json.posts[0].shared
        document.bookmark.toread.checked = json.posts[0].toread
    })
}

safari.application.addEventListener('validate', validateHandler, false)

function validateHandler (event) {
    event.target.disabled = !event.target.browserWindow.activeTab.url
}

document.bookmark.add.addEventListener('click', submitAction, false)

function submitAction (event) {
    var url = document.bookmark.url.value
    var title = document.bookmark.title.value
    var description = document.bookmark.description.value
    var tags = document.bookmark.tags.value
    var private = document.bookmark.private.checked
    var toread = document.bookmark.toread.checked

    var endpoint = pinboardEndpoint('/posts/add/', url) + '&description=' + title + '&shared=' + (private ? 'yes' : 'no')
    if (description != '') endpoint += '&extended=' + description
    if (tags != '') endpoint += '&tags=' + tags
    if (toread) endpoint += '&toread=' + 'yes'

    sendRequest(endpoint, function (response) {
        var code = response.responseXML.getElementsByTagName('result')[0].attributes.getNamedItem('code').value

        if (code === 'done') safari.extension.popovers[0].hide()
    })
}

safari.application.addEventListener('message', respondToMessage, false)

function respondToMessage (event) {
    if (event.name !== 'descriptionForTab') return

    if (!event.message) return

    document.bookmark.description.value = event.message
}

function pinboardEndpoint (method, url) {
    var username = safari.extension.secureSettings.username
    var password = safari.extension.secureSettings.password

    return ('https://' + username + ':' + password + '@api.pinboard.in/v1' + method + '?format=json&url=' + url)
}

function cleanPinboardJSON (text) {
    text = text.replace(/'/g, '"')
    text = text.replace(/([,{] ?)(\w+) ?:/g, "$1\"$2\":")
    text = text.replace(/\[ ?\{ ?\} ?\]/g, '[]')

    return text
}

function sendRequest (url, callback) {
    var request = new XMLHttpRequest()

    request.addEventListener('load', function (event) { callback(request) }, false)

    request.open('GET', url)
    request.send(null)
}

function log (text) {
    document.getElementById('console').innerText += text + '\n'
}
