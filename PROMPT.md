# The Clever Fox's Gem Quest - Prompt History

This file documents the AI prompts used to generate this game using Google's Gemini. 

## The Master Prompt
*If you ever want to recreate this exact game from scratch, this is the complete prompt that describes all of the game's final mechanics, styling, and win conditions.*

```text
Code a kid-friendly, relaxing, yet engaging color-matching game in p5.js. No HTML, just the code. 

**Theme & Visuals:**
- The background should be a beautiful, deep magical night forest with slowly drifting fireflies and simple silhouetted trees.
- The player controls a cute, pixelated multi-colored fox that stays near the bottom of the screen.
- Falling objects are glowing, pixelated gems in four colors: RED, BLUE, GREEN, and YELLOW.

**Mechanics:**
- The fox automatically follows the mouse cursor's horizontal position smoothly (using lerp).
- The game tells the player to "Catch the [COLOR] gems!" with text at the top of the screen.
- Gems fall slowly from the top of the screen.
- If the fox catches the correct colored gem: Score increases by 1, a small star particle effect plays, and a progress streak bar fills up.
- Every 5 correct catches, the target color randomly changes to a new color.
- If the fox catches the wrong colored gem: No points are lost, but it turns into a puff of grey dust and the progress streak resets to zero.

**Win Condition:**
- The game requires 30 points to win. 
- Once 30 points are reached, stop spawning gems. 
- Display a giant "YOU WIN! AMAZING JOB!" message in the center of the screen with colorful bouncing text.
- Spawn continuous, colorful fireworks in the background.
- Allow the player to continue moving the fox around at the bottom of the screen to enjoy the fireworks.