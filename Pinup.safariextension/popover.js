safari.application.addEventListener('popover', popoverHandler, false)

function popoverHandler (event) {
    var url = safari.application.activeBrowserWindow.activeTab.url
    var title = safari.application.activeBrowserWindow.activeTab.title

    document.getElementById('url').value = url
    document.getElementById('title').value = title
}

safari.application.addEventListener('validate', validateHandler, false)

function validateHandler (event) {
    event.target.disabled = !event.target.browserWindow.activeTab.url

    if (safari.extension.settings.checkEveryPage) {
        var url = safari.application.activeBrowserWindow.activeTab.url
        var api = pinboardEndpoint() + 'posts/get/?format=json&url=' + url

        sendRequest(api, function (text) {
            text = cleanPinboardJSON(text)
            response = JSON.parse(text)

            if (response.posts.length == 2) {
                event.target.image = safari.extension.baseURI + 'pinupEdit.png'
            } else {
                event.target.image = safari.extension.baseURI + 'pinupToolbarIcon.png'
            }
        })
    }
}

function pinboardEndpoint () {
    var username = safari.extension.secureSettings.username
    var password = safari.extension.secureSettings.password

    return ('https://' + username + ':' + password + '@api.pinboard.in/v1/')
}

function cleanPinboardJSON (text) {
    text = text.replace(/'/g, '"')
    text = text.replace(/([,{] ?)(\w+) ?:/g, "$1\"$2\":")
    text = text.replace(/\[ ?\{ ?\} ?\]/g, '[]')

    return text
}

function sendRequest (url, callback) {
    var request = new XMLHttpRequest()

    request.addEventListener('load', function (event) {
        callback(request.responseText)
    }, false)

    request.open('GET', url)
    request.send(null)
}

function log (text) {
    document.getElementById('console').innerText += text + '\n'
}
