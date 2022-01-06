const gifButton = document.getElementById('gifButton')
const gifPopup = document.getElementById('gifPopup')
const gifPopupContent = document.getElementById('gifPopupContent')
const tenorSearch = document.getElementById('searchTenor')
const gifsWrapper = document.querySelector('.gifsWrapper')

let gifPopupOpened = false

gifButton.addEventListener('click', e=> {
    stickerPopupContent.style.visibility = "hidden"
    tenorSearch.value = ""
    if (gifPopupOpened){
        gifPopupContent.style.visibility = "hidden"
        gifPopupOpened = false;
        return
    }
    popupOpened = false;
    gifPopupOpened = true
    gifPopupContent.style.visibility = "visible"
    grab_data()
    e.stopPropagation()
})

function httpGetAsync(theUrl, callback)
{
    // create the request object
    var xmlHttp = new XMLHttpRequest();

    // set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            callback(xmlHttp.responseText);
        }
    }

    // open as a GET call, pass in the url and set async = True
    xmlHttp.open("GET", theUrl, true);

    // call send with no params as they were passed in on the url string
    xmlHttp.send(null);

    return;
}

// callback for trending top 10 GIFs
function tenorCallback_trending(responsetext)
{
    // parse the json response
    var response_objects = JSON.parse(responsetext);

    top_10_gifs = response_objects["results"];

    // load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (tinygif)

    gifsWrapper.innerHTML += `<div class="gif gifCategory">
        <a style="visibility:hidden;" href="https://g.tenor.com/v1/trending?key=OTAK91DQW344&limit=10"></a>
            <img src="${top_10_gifs[0]["media"][0]["nanogif"]["url"]}" alt="" class="backgroundImage">
            <p class="imageDescription">Trending</p>
        </div>
        `
    var cat_url = "https://g.tenor.com/v1/categories?key=OTAK91DQW344";
    httpGetAsync(cat_url,tenorCallback_categories)

    return;

}

// callback for GIF categories
function tenorCallback_categories(responsetext)
{
    // parse the json response
    var response_objects = JSON.parse(responsetext);

    categories = response_objects["tags"];

    // load the categories - example is for the first category

    // url to load:
    var imgurl = categories[0]["image"];

    // text to overlay on image:
    var txt_overlay = categories[0]["name"];


    // search to run if user clicks the category
    var category_search_path = categories[0]["path"];

    for (let category of categories){
        gifsWrapper.innerHTML += `<div class="gif gifCategory">
        <a style="visibility:hidden;" href="${category["path"]}"></a>
            <img src="${category["image"]}" alt="gif category" class="backgroundImage">
            <p class="imageDescription">${category["name"]}</p>
        </div>
        `
    }

    document.querySelectorAll('.gifCategory').forEach(div=>{
        div.addEventListener('click', async e=>{
            gifsWrapper.innerHTML = ""
            const res = await fetch(div.querySelector('a').href)
            const data = await res.json()
            for (let gif of data.results){
                gifsWrapper.innerHTML += `<div class="gif ">
                    <img src="${gif.media[0].gif.url}" alt="gif" class="gifPreview">
                </div>`
            }
            createGifClickListener()
        })
    })

    // document.getElementById("category_gif").src = imgurl
    // document.getElementById("catgif_caption").innerHTML = txt_overlay
    // document.getElementById("cat_link").href = category_search_path

    return;
}



// function to call the trending and category endpoints
function grab_data()
{
    var apikey = "OTAK91DQW344";
    var lmt = 10;
    gifsWrapper.innerHTML =  ""
    // get the top 10 trending GIFs (updated through out the day) - using the default locale of en_US
    var trending_url = "https://g.tenor.com/v1/trending?key=" + apikey + "&limit=" + lmt;
    httpGetAsync(trending_url,tenorCallback_trending);
    
    tenorSearch.addEventListener('keyup', ()=>{
        if (typingTimer) clearTimeout(typingTimer)
        typingTimer = setTimeout(async ()=>{
            gifsWrapper.innerHTML = ""
            if (tenorSearch.value.length < 1){
                grab_data()
                return
            }
            const res = await fetch(`https://g.tenor.com/v1/search?q=${tenorSearch.value}&key=${apikey}&limit=20`)
            const data = await res.json()
            for (let gif of data.results){
                gifsWrapper.innerHTML += `<div class="gif ">
                    <img src="${gif.media[0].gif.url}" alt="gif" class="gifPreview">
                </div>`
            }
            createGifClickListener()
        },1200)
    })
    
    // data will be loaded by each call's callback
    return;
}

function createGifClickListener(){
    gifsWrapper.querySelectorAll('.gif').forEach(gif=>{
        gif.addEventListener('click', async e=>{
            await messageSendHandler(gif.querySelector('img').src, null, null)
            gifButton.click()
        })
    })
}