!function(e){var t={};function n(r){if(t[r])return t[r].exports;var s=t[r]={i:r,l:!1,exports:{}};return e[r].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)n.d(r,s,function(t){return e[t]}.bind(null,s));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){n(1),n(2)},function(e,t){window.store=new class{constructor(){this.lineItems=[],this.products={},this.productsFetchPromise=null,this.displayPaymentSummary()}getPaymentTotal(){return Object.values(this.lineItems).reduce((e,{product:t,sku:n,quantity:r})=>e+r*this.products[t].skus.data[0].price,0)}getLineItems(){let e=[];return this.lineItems.forEach(t=>e.push({type:"sku",parent:t.sku,quantity:t.quantity})),e}async getConfig(){try{const e=await fetch("/config"),t=await e.json();return t.stripePublishableKey.includes("live")&&(document.querySelector("#order-total .demo").style.display="none"),t}catch(e){return{error:e.message}}}loadProducts(){return this.productsFetchPromise||(this.productsFetchPromise=new Promise(async e=>{const t=await fetch("/products");(await t.json()).data.forEach(e=>this.products[e.id]=e),e()})),this.productsFetchPromise}async createPaymentIntent(e,t){try{const n=await fetch("/payment_intents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currency:e,items:t})}),r=await n.json();return r.error?{error:r.error}:r}catch(e){return{error:e.message}}}async updatePaymentIntentWithShippingCost(e,t,n){try{const r=await fetch(`/payment_intents/${e}/shipping_change`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({shippingOption:n,items:t})}),s=await r.json();return s.error?{error:s.error}:s}catch(e){return{error:e.message}}}formatPrice(e,t){let n=(e/100).toFixed(2);return new Intl.NumberFormat(["en-US"],{style:"currency",currency:t,currencyDisplay:"symbol"}).format(n)}async displayPaymentSummary(){await this.loadProducts();const e=document.getElementById("order-items"),t=document.getElementById("order-total");let n;for(let[t,r]of Object.entries(this.products)){const t=((e,t)=>(e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e))(1,2);let s=r.skus.data[0],a=this.formatPrice(s.price,s.currency),o=this.formatPrice(s.price*t,s.currency),c=document.createElement("div");c.classList.add("line-item"),c.innerHTML=`\n        <img class="image" src="/images/products/${r.id}.png">\n        <div class="label">\n          <p class="product">${r.name}</p>\n          <p class="sku">${Object.values(s.attributes).join(" ")}</p>\n        </div>\n        <p class="count">${t} x ${a}</p>\n        <p class="price">${o}</p>`,e.appendChild(c),n=s.currency,this.lineItems.push({product:r.id,sku:s.id,quantity:t})}const r=this.formatPrice(this.getPaymentTotal(),n);t.querySelector("[data-subtotal]").innerText=r,t.querySelector("[data-total]").innerText=r}}},function(e,t){(async()=>{"use strict";const e=await store.getConfig(),t=document.getElementById("payment-form"),n=t.querySelector("button[type=submit]");let r;const s=Stripe(e.stripePublishableKey,{betas:["payment_intent_beta_3"]}),a=s.elements(),o={base:{iconColor:"#666ee8",color:"#31325f",fontWeight:400,fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',fontSmoothing:"antialiased",fontSize:"15px","::placeholder":{color:"#aab7c4"},":-webkit-autofill":{color:"#666ee8"}}},c=a.create("card",{style:o});c.mount("#card-element"),c.on("change",({error:e})=>{const t=document.getElementById("card-errors");e?(t.textContent=e.message,t.classList.add("visible")):t.classList.remove("visible"),n.disabled=!1});const i={style:o,supportedCountries:["SEPA"]},l=a.create("iban",i);l.mount("#iban-element"),l.on("change",({error:e,bankName:t})=>{const r=document.getElementById("iban-errors");e?(r.textContent=e.message,r.classList.add("visible")):(r.classList.remove("visible"),t&&v("sepa_debit",t)),n.disabled=!1});const u=a.create("idealBank",{style:{base:Object.assign({padding:"10px 15px"},o.base)}});u.mount("#ideal-bank-element"),await store.loadProducts();const d=s.paymentRequest({country:e.stripeCountry,currency:e.currency,total:{label:"Total",amount:store.getPaymentTotal()},requestShipping:!0,requestPayerEmail:!0,shippingOptions:e.shippingOptions});d.on("source",async e=>{const{error:t}=await s.confirmPaymentIntent(r.client_secret,{source:e.source.id,use_stripe_sdk:!0});if(t)e.complete("fail"),y({error:t});else{e.complete("success");const t=await s.handleCardPayment(r.client_secret);y(t)}}),d.on("shippingaddresschange",e=>{e.updateWith({status:"success"})}),d.on("shippingoptionchange",async t=>{const s=await store.updatePaymentIntentWithShippingCost(r.id,store.getLineItems(),t.shippingOption);t.updateWith({total:{label:"Total",amount:s.paymentIntent.amount},status:"success"});const a=store.formatPrice(s.paymentIntent.amount,e.currency);n.innerText=`Pay ${a}`});const m=a.create("paymentRequestButton",{paymentRequest:d});await d.canMakePayment()&&(m.mount("#payment-request-button"),document.querySelector(".instruction").innerText="Or enter your shipping and payment details below",document.getElementById("payment-request").classList.add("visible")),t.querySelector("select[name=country]").addEventListener("change",e=>{e.preventDefault(),w(e.target.value)}),t.addEventListener("submit",async e=>{e.preventDefault();const a=t.querySelector("input[name=payment]:checked").value,o=t.querySelector("input[name=name]").value,i=t.querySelector("select[name=country] option:checked").value,d=t.querySelector("input[name=email]").value;t.querySelector("input[name=address]").value,t.querySelector("input[name=city]").value,t.querySelector("input[name=postal_code]").value,t.querySelector("input[name=state]").value;if(n.disabled=!0,n.textContent="Processing…","card"===a){const e=await s.handleCardPayment(r.client_secret,c,{source_data:{owner:{name:o}}});y(e)}else if("sepa_debit"===a){const e=await s.confirmPaymentIntent(r.client_secret,l,{source_data:{type:"sepa_debit",owner:{name:o,email:d},mandate:{notification_method:"email"}}});y(e)}else{const e={type:a,amount:r.amount,currency:r.currency,owner:{name:o,email:d},redirect:{return_url:window.location.href},statement_descriptor:"Stripe Payments Demo",metadata:{paymentIntent:r.id}};switch(a){case"ideal":const{source:t}=await s.createSource(u,e);return void p(t);case"sofort":e.sofort={country:i};break;case"ach_credit_transfer":e.owner.email=`amount_${r.amount}@example.com`}const{source:t}=await s.createSource(e);p(t)}});const y=e=>{const{paymentIntent:t,error:n}=e,r=document.getElementById("main"),s=document.getElementById("confirmation");n?(r.classList.remove("processing"),r.classList.remove("receiver"),s.querySelector(".error-message").innerText=n.message,r.classList.add("error")):"succeeded"===t.status?(r.classList.remove("processing"),r.classList.remove("receiver"),s.querySelector(".note").innerText="We just sent your receipt to your email address, and your items will be on their way shortly.",r.classList.add("success")):"processing"===t.status?(r.classList.remove("processing"),s.querySelector(".note").innerText="We’ll send your receipt and ship your items as soon as your payment is confirmed.",r.classList.add("success")):(r.classList.remove("success"),r.classList.remove("processing"),r.classList.remove("receiver"),r.classList.add("error"))},p=s=>{const a=document.getElementById("main"),o=document.getElementById("confirmation");switch(s.flow){case"none":if("wechat"===s.type){new QRCode("wechat-qrcode",{text:s.wechat.qr_code_url,width:128,height:128,colorDark:"#424770",colorLight:"#f8fbfd",correctLevel:QRCode.CorrectLevel.H});t.querySelector(".payment-info.wechat p").style.display="none";let a=store.formatPrice(store.getPaymentTotal(),e.currency);n.textContent=`Scan this QR code on WeChat to pay ${a}`,g(r.id,3e5)}else console.log("Unhandled none flow.",s);break;case"redirect":n.textContent="Redirecting…",window.location.replace(s.redirect.url);break;case"code_verification":break;case"receiver":a.classList.add("success","receiver");const c=o.querySelector(".receiver .info");let i=store.formatPrice(s.amount,e.currency);switch(s.type){case"ach_credit_transfer":const e=s.ach_credit_transfer;c.innerHTML=`\n              <ul>\n                <li>\n                  Amount:\n                  <strong>${i}</strong>\n                </li>\n                <li>\n                  Bank Name:\n                  <strong>${e.bank_name}</strong>\n                </li>\n                <li>\n                  Account Number:\n                  <strong>${e.account_number}</strong>\n                </li>\n                <li>\n                  Routing Number:\n                  <strong>${e.routing_number}</strong>\n                </li>\n              </ul>`;break;case"multibanco":const t=s.multibanco;c.innerHTML=`\n              <ul>\n                <li>\n                  Amount (Montante):\n                  <strong>${i}</strong>\n                </li>\n                <li>\n                  Entity (Entidade):\n                  <strong>${t.entity}</strong>\n                </li>\n                <li>\n                  Reference (Referencia):\n                  <strong>${t.reference}</strong>\n                </li>\n              </ul>`;break;default:console.log("Unhandled receiver flow.",s)}g(r.id)}},g=async(e,t=3e4,n=500,r=null)=>{r=r||Date.now();const s=["succeeded","processing","canceled"],a=await fetch(`payment_intents/${e}/status`),o=await a.json();!s.includes(o.paymentIntent.status)&&Date.now()<r+t?setTimeout(g,n,e,t,n,r):(y(o),s.includes(o.paymentIntent.status)||console.warn(new Error("Polling timed out.")))},h=new URL(window.location.href),f=document.getElementById("main");if(h.searchParams.get("source")&&h.searchParams.get("client_secret")){f.classList.add("checkout","success","processing");const{source:e}=await s.retrieveSource({id:h.searchParams.get("source"),client_secret:h.searchParams.get("client_secret")});g(e.metadata.paymentIntent)}else{f.classList.add("checkout");const t=await store.createPaymentIntent(e.currency,store.getLineItems());r=t.paymentIntent}document.getElementById("main").classList.remove("loading");const b={ach_credit_transfer:{name:"Bank Transfer",flow:"receiver",countries:["US"],currencies:["usd"]},alipay:{name:"Alipay",flow:"redirect",countries:["CN","HK","SG","JP"],currencies:["aud","cad","eur","gbp","hkd","jpy","nzd","sgd","usd"]},bancontact:{name:"Bancontact",flow:"redirect",countries:["BE"],currencies:["eur"]},card:{name:"Card",flow:"none"},eps:{name:"EPS",flow:"redirect",countries:["AT"],currencies:["eur"]},ideal:{name:"iDEAL",flow:"redirect",countries:["NL"],currencies:["eur"]},giropay:{name:"Giropay",flow:"redirect",countries:["DE"],currencies:["eur"]},multibanco:{name:"Multibanco",flow:"receiver",countries:["PT"],currencies:["eur"]},sepa_debit:{name:"SEPA Direct Debit",flow:"none",countries:["FR","DE","ES","BE","NL","LU","IT","PT","AT","IE","FI"],currencies:["eur"]},sofort:{name:"SOFORT",flow:"redirect",countries:["DE","AT"],currencies:["eur"]},wechat:{name:"WeChat",flow:"none",countries:["CN","HK","SG","JP"],currencies:["aud","cad","eur","gbp","hkd","jpy","nzd","sgd","usd"]}},v=(t,r)=>{let s=store.formatPrice(store.getPaymentTotal(),e.currency),a=b[t].name,o=`Pay ${s}`;"card"!==t&&(o=`Pay ${s} with ${a}`),"wechat"===t&&(o=`Generate QR code to pay ${s} with ${a}`),"sepa_debit"===t&&r&&(o=`Debit ${s} from ${r}`),n.innerText=o},w=e=>{const t=document.getElementById("country");t.querySelector(`option[value=${e}]`).selected="selected",t.className=`field ${e}`,S(),P()},S=e=>{e||(e=t.querySelector("select[name=country] option:checked").value),t.querySelector("label.zip").parentElement.classList.toggle("with-state","US"===e),t.querySelector("label.zip span").innerText="US"===e?"ZIP":"GB"===e?"Postcode":"Postal Code"},P=n=>{n||(n=t.querySelector("select[name=country] option:checked").value);const r=t.querySelectorAll("input[name=payment]");for(let t=0;t<r.length;t++){let s=r[t];s.parentElement.classList.toggle("visible","card"===s.value||e.paymentMethods.includes(s.value)&&b[s.value].countries.includes(n)&&b[s.value].currencies.includes(e.currency))}const s=document.getElementById("payment-methods");s.classList.toggle("visible",s.querySelectorAll("li.visible").length>1),r[0].checked="checked",t.querySelector(".payment-info.card").classList.add("visible"),t.querySelector(".payment-info.ideal").classList.remove("visible"),t.querySelector(".payment-info.sepa_debit").classList.remove("visible"),t.querySelector(".payment-info.wechat").classList.remove("visible"),t.querySelector(".payment-info.redirect").classList.remove("visible"),v(r[0].value)};for(let e of document.querySelectorAll("input[name=payment]"))e.addEventListener("change",e=>{e.preventDefault();const n=t.querySelector("input[name=payment]:checked").value,r=b[n].flow;v(e.target.value),t.querySelector(".payment-info.card").classList.toggle("visible","card"===n),t.querySelector(".payment-info.ideal").classList.toggle("visible","ideal"===n),t.querySelector(".payment-info.sepa_debit").classList.toggle("visible","sepa_debit"===n),t.querySelector(".payment-info.wechat").classList.toggle("visible","wechat"===n),t.querySelector(".payment-info.redirect").classList.toggle("visible","redirect"===r),t.querySelector(".payment-info.receiver").classList.toggle("visible","receiver"===r),document.getElementById("card-errors").classList.remove("visible","card"!==n)});let L=e.country;var q=new URLSearchParams(window.location.search);let _=q.get("country")?q.get("country").toUpperCase():e.country;t.querySelector(`option[value="${_}"]`)&&(L=_),w(L)})()}]);