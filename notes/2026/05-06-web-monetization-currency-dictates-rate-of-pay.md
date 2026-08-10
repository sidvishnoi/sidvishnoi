---
description: Without sub-cent precision, the "frame rate" of a money stream becomes an accident of exchange rates rather than a technical standard.
date: 2026-05-06T21:40:10+05:30
tags:
  - '#WebMonetization'
---

# Currency choice dictates the "rate of pay" in Web Monetization

The streaming feel of Web Monetization shouldn't depend on which currency you hold, but it does at present. If a wallet is locked to two decimal places (`assetScale=2`), the value of the currency dictates the frequency of the payments.

Compare three users paying the same "real" value per hour:

- At USD $0.60/hour, to send the next $0.01 (and fire a monetiation event), the [Web Monetization agent](https://github.com/interledger/web-monetization-extension) waits 60 seconds [^1]. This is a slideshow, not a stream.
- At MXN 10/hour, the monetization event fires every 3.6 seconds, which feels more like a stream.
- At INR ₹50/hour, a monetization event can be fired every 0.72 seconds. Now that's a stream!

In the MXN scenario, the publisher gets monetization events 16 times more frequently (in the INR scenario, it's 83 times more frequently). The vibe feels alive: the publisher is getting money, and the user is getting more and more content in return - imagine a video buffering based on these micropayments.

We shouldn't have to switch to a different currency to get a higher _frame rate_ for our payments. The streaming logic should be independent of the unit.

Under the current `assetScale=2` limitation, a smooth payment stream experience is an accidental byproduct of having a _weaker_ currency. This reinforces why a [higher `assetScale` of 3 or 4 is a must](./05-05-web-monetization-needs-assetscale-3.md) - it decouples (somewhat) the frequency of the payment from the value of the currency's base unit.

[^1]: This is where that 60s comes from:

    <math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mfrac><mrow><mn>0.01</mn><mtext>&nbsp;</mtext><mpadded lspace="0"><mi>USD</mi></mpadded></mrow><mrow><mo fence="true" form="prefix" stretchy="true">(</mo><mfrac><mrow scriptlevel="2" style="math-depth: 2;"><mn>0.60</mn><mtext>&nbsp;</mtext><mrow><mrow><mi mathvariant="normal">U</mi><mspace></mspace></mrow><mrow><mi mathvariant="normal">S</mi><mspace></mspace></mrow><mrow><mi mathvariant="normal">D</mi><mspace></mspace></mrow><mi>/</mi><mrow><mi mathvariant="normal">h</mi><mspace></mspace></mrow></mrow></mrow><mrow scriptlevel="2" style="math-depth: 2;"><mn>3600</mn><mtext>&nbsp;</mtext><mrow><mrow><mi mathvariant="normal">s</mi><mspace></mspace></mrow><mi>/</mi><mrow><mi mathvariant="normal">h</mi><mspace></mspace></mrow></mrow></mrow></mfrac><mo fence="true" form="postfix" stretchy="true">)</mo></mrow></mfrac><mo>=</mo><mn>60</mn><mtext>&nbsp;</mtext><mrow><mi mathvariant="normal">s</mi><mspace></mspace></mrow></mrow></math>

    <!-- ^^ \frac{0.01\ \mathrm{USD}}{\left( \frac{0.60\ \mathrm{USD/h}}{3600\ \mathrm{s/h}} \right)} = 60\ \mathrm{s} -->
