safari.application.addEventListener('popover', popoverHandler, false)

// set up popover
function popoverHandler (event) {
    var url = safari.application.activeBrowserWindow.activeTab.url
    var title = safari.application.activeBrowserWindow.activeTab.title

    // reset form
    document.bookmark.add.value = 'Checking...'
    document.bookmark.url.value = url
    document.bookmark.title.value = title
    document.bookmark.description.value = ''
    document.bookmark.tags.value = ''
    // default to private
    document.bookmark.private.checked = true

    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updateDescription')

    var api = pinboardEndpoint('/posts/get/', url)

    sendRequest(api, function (response) {
        document.bookmark.add.disabled = false;

        var json = JSON.parse(cleanPinboardJSON(response.responseText))

        if (json.posts.length == 0) {
            document.bookmark.add.value = 'Add Bookmark';
            return
        }

        document.bookmark.add.value = 'Edit Bookmark'
        document.bookmark.title.value = json.posts[0].description
        document.bookmark.description.value = json.posts[0].extended
        document.bookmark.tags.value = json.posts[0].tags
        document.bookmark.private.checked = (json.posts[0].shared == "no")
        document.bookmark.toread.checked = (json.posts[0].toread == "yes")
    })

    document.bookmark.add.disabled = true;
}

safari.application.addEventListener('validate', validateHandler, false)

function validateHandler (event) {
    event.target.disabled = !event.target.browserWindow.activeTab.url
}

document.bookmark.add.addEventListener('click', submitAction, false)

function submitAction (event) {
    document.bookmark.add.disabled = true;
    document.bookmark.add.value = 'Submitting...'

    var url = document.bookmark.url.value
      , title = document.bookmark.title.value
      , description = document.bookmark.description.value
      , tags = document.bookmark.tags.value
      , private = document.bookmark.private.checked
      , toread = document.bookmark.toread.checked
      , endpoint = pinboardEndpoint('/posts/add/', url) + '&description=' + encodeURIComponent(title) + '&shared=' + (private ? 'no' : 'yes') + '&toread=' + (toread ? 'yes' : 'no')

    if (description !== '') endpoint += ('&extended=' + encodeURIComponent(description))
    if (tags != '') endpoint += ('&tags=' + encodeURIComponent(tags))

    sendRequest(endpoint, function (response) {
        var json = JSON.parse(cleanPinboardJSON(response.responseText))
        var code = json.result_code

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
    var username = encodeURIComponent(safari.extension.secureSettings.username)
    var password = encodeURIComponent(safari.extension.secureSettings.password)

    return ('https://' + username + ':' + password + '@api.pinboard.in/v1' + method + '?format=json&url=' + encodeURIComponent(url))
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
