!function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e){window.store=new class{constructor(){this.lineItems=[],this.products={},this.productsFetchPromise=null,this.displayPaymentSummary()}getPaymentTotal(){return Object.values(this.lineItems).reduce((t,{product:e,sku:r,quantity:n})=>t+n*this.products[e].skus.data[0].price,0)}getLineItems(){let t=[];return this.lineItems.forEach(e=>t.push({type:"sku",parent:e.sku,quantity:e.quantity})),t}async getConfig(){try{const t=await fetch("undefined/config"),e=await t.json();return e.stripePublishableKey.includes("live")&&(document.querySelector("#order-total .demo").style.display="none"),e}catch(t){return{error:t.message}}}loadProducts(){return this.productsFetchPromise||(this.productsFetchPromise=new Promise(async t=>{const e=await fetch("undefined/products");(await e.json()).data.forEach(t=>this.products[t.id]=t),t()})),this.productsFetchPromise}async createPaymentIntent(t,e){try{const r=await fetch("undefined/payment_intents",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currency:t,items:e})}),n=await r.json();return n.error?{error:n.error}:n}catch(t){return{error:t.message}}}async updatePaymentIntentWithShippingCost(t,e,r){try{const n=await fetch(`undefined/shipping_change?id=${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({shippingOption:r,items:e})}),o=await n.json();return o.error?{error:o.error}:o}catch(t){return{error:t.message}}}formatPrice(t,e){let r=(t/100).toFixed(2);return new Intl.NumberFormat(["en-US"],{style:"currency",currency:e,currencyDisplay:"symbol"}).format(r)}async displayPaymentSummary(){await this.loadProducts();const t=document.getElementById("order-items"),e=document.getElementById("order-total");let r;for(let[e,n]of Object.entries(this.products)){const e=((t,e)=>(t=Math.ceil(t),e=Math.floor(e),Math.floor(Math.random()*(e-t+1))+t))(1,2);let o=n.skus.data[0],i=this.formatPrice(o.price,o.currency),s=this.formatPrice(o.price*e,o.currency),a=document.createElement("div");a.classList.add("line-item"),a.innerHTML=`\n        <img class="image" src="/images/products/${n.id}.png">\n        <div class="label">\n          <p class="product">${n.name}</p>\n          <p class="sku">${Object.values(o.attributes).join(" ")}</p>\n        </div>\n        <p class="count">${e} x ${i}</p>\n        <p class="price">${s}</p>`,t.appendChild(a),r=o.currency,this.lineItems.push({product:n.id,sku:o.id,quantity:e})}const n=this.formatPrice(this.getPaymentTotal(),r);e.querySelector("[data-subtotal]").innerText=n,e.querySelector("[data-total]").innerText=n}}}]);