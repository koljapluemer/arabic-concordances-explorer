---
layout: post
title: Disconnected thoughts on why my concordances tool is not fun to use
tags:
  - learning
  - arabic
description: Thoughts about game loops based on the corpus-based, data-driven learning game I'm building
---

I recently built [a site](https://arabic-concordances.koljapluemer.com/) where you can practice Arabic by translating sentences from a real corpus, by using concordances to reverse-engineer vocabulary that you don't know. It's not very fun to use. Why?

Here are some ideas:

1. Game loop doesn't work on any level. The click-to-click interaction isn't very intriguing, and level or larger story don't exist. Thing is, it's not like I'm to lazy to build them, I'm just unsure what to build...and how to make a click-on-text interaction fun?
2. There is a missing difficulty gradient. Sentence difficulty is static, or rather, random. I gave up on this because I couldn't find a convincing heuristic for *sentence difficulty*. A combination of length, rarity of words, and overlap with previously seen words, *maybe*? But first, this is very difficult (Arabic likes ending sentence without punctuation, to recognize a word you need lemmas, ...) and second, would that make the game *fun*?
3. Interest: Although translating "real" (as opposed to created for a textbook) sentences is somewhat fun, somewhat feels like a kind of emergence (even for me as the game author), it's still not genuinely intriguing. I essentially learned English with Reddit, YouTube and fiction books, assimilating language by consuming interesting content. Random corpus sentences are quite far from that, but how would you find a user-specific stream of interesting content in a target language?

Overall, my main takeaways are:

1. Damn, the world of corpus learning (and all the stuff that comes with it) is *large*.
2. I still don't have a very good Mental Model of the minimum requirement to make a given game fun, compelling enough to get the player to come back. Sure, there are some games which are neat and fun and colorful and complex and social and all that, but what about games or tools that are simple along almost all dimensions, like *Cookie Clicker* or even *DuoLingo*, and they still work, in a certain sense. What exactly is the threshold they cleared and I did not?