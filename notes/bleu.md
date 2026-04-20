# Bleu: a fully featured smart static website generator

Bleu is a fully featured and extensible static website generator SSG that aims at reducing build time. It does so by building only what needs to be built, unlike other SSGs which build entire site from scratch. It only rebuilds updated files and takes into account the dependencies between different parts of a website.

![Bleu logo](https://user-images.githubusercontent.com/8426945/62229602-a9d58d80-b3dd-11e9-9875-56b56e453a64.png)

Bleu was targetted to be used on large static websites (like blogs, news media, software documentation). I've used Jekyll earlier but building entire website from scratch didn't turn out fine for me. The incremental builds were not applicable on my website. (Jekyll is a really great software though ♥). So, I built Bleu so that it'll match my needs of faster regeneration. Bleu makes uses of NodeJS environment, so many web developers can use it (and extend it) really easily.

Bleu is fully functional and I've been using it on my website : [www.hoopsvilla.com][1].

So far, Bleu is my largest project (also in terms on codebase - around 18 KLOC). Sadly, I haven't released it yet as I think the codebase has maintenance issues due to my lack of understanding and experience of designing large projects. Also, I've been busy in other projects and college. I'll release it as an open source project after a re-write (around October-November 2018).

![bleu build demo](https://user-images.githubusercontent.com/8426945/62229429-42b7d900-b3dd-11e9-8fc1-4731f814ed0a.png)
![bleu docs website](https://user-images.githubusercontent.com/8426945/62229463-53684f00-b3dd-11e9-8722-a8ef4410b67b.png)

Although I haven't released Bleu, I've made it's documentation public (built using Bleu ofcourse). You can see the docs at: [bleu-docs-temp.surge.sh/docs/][2].

The present source code related to Bleu are available at:

- [https://gitlab.com/sidvishnoi/bleu][3]
- [https://gitlab.com/sidvishnoi/bleu-docs][4]
- [https://gitlab.com/sidvishnoi/bleu-plugins][5]

[1]: http://www.hoopsvilla.com
[2]: https://bleu-docs-temp.surge.sh/docs/welcome/
[3]: https://gitlab.com/sidvishnoi/bleu
[4]: https://gitlab.com/sidvishnoi/bleu-docs
[5]: https://gitlab.com/sidvishnoi/bleu-plugins
