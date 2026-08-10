---
description: $0.01 isn't a micropayment. Open Payments wallets' assetScale matters for Web Monetization's success
date: 2026-05-05T21:48:10+05:30
tags:
  - '#WebMonetization'
  - '#OpenPayments'
---

# Web Monetization needs `assetScale` greater than 2

To be blunt: $0.01 isn't a micropayment. It's a "small payment". There's a difference. If a payment amount is limited to two decimal places, it won't lead to _streaming_ money, which is something I'd like to see from Web Monetization.

At a rate of $0.60/hour, a user has to stay on a page for a full 60 seconds to pay the next cent. If they leave at 45 seconds, the publisher gets nothing, other than the first payment on page load [^1]. That 60-second gap is a massive failure point.

By supporting `assetScale` 3 (or higher), we can move $0.001 every six seconds at the same $0.60/hour rate. This shift in resolution is what makes the payment feel like a continuous stream. It allows a website to respond to a user's presence in near real-time.

In many emerging markets, $0.01 actually buys something. We can't build a global micro-economy if the smallest building block is too expensive. Even in a [USD context](./05-06-web-monetization-currency-dictates-rate-of-pay.md), a $5 monthly budget is exhausted after just 500 page views if each hit costs a cent. We want more money to be sent to pages where we actually spend time.

If we want to monetize a short blog post, a news story, or a few seconds of a song, we have to get comfortable with sub-cent math.

The underlying Interledger protocol, Open Payments, and Web Monetization -- all support this higher precision. The bottleneck is in the wallet implementations and at the settlement layers. If wallets don't support higher scales, Web Monetization will need to look into alternative payment models.

[^1]: Removing the initial payment on page view isn't a good idea either - the website wants to know you're a paying visitor without waiting, but that initial payment is independent of the quality time spent on a website.
