const nameInput = document.getElementById('nameInput')
const ih = document.getElementById('imageHolder')
setTimeout(()=>{
    if (window.ethereum){
        if (ethereum.isConnected()){
            if (!ethereum.selectedAddress){
                ethereum.enable().then(()=>{
                    getAssetsById(ethereum.selectedAddress)
                })
            }else{
                getAssetsById(ethereum.selectedAddress)
            }
        }else{
            console.log('ok wtf')
        }
    }else{
        console.log('nooooo')
    }
}, 1000)

async function getAssetsById(id){
    const res = await fetch(`https://api.opensea.io/api/v1/assets?owner=${id}&order_direction=desc&offset=0&limit=20`)
    const data = await res.json()
    console.log(data)
    for (let asset of data.assets){
        let html = `<img src=${asset.image_url} alt="Nani?"/>`
        ih.innerHTML += html
    }
}
nameInput.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
        getAssetsById(e.target.value)
    }
})