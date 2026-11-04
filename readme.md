# Snake 2.0

A Hamiltonian-cycle-guided Snake AI with A* shortcut pathfinding, playable human mode, and a responsive visualization dashboard.

## Preview this branch locally

The app is a static website. From the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` in your browser. No build or package installation is required.

## Controls

- **AI / Human**: switch between the original autonomous and player modes (starts a new round).
- **Pause / Restart**: control the current game or begin a new one.
- **Speed**: 1×, 2×, 5×, 10×, 25×, or 50× simulation updates per frame.
- **Hamiltonian cycle**: visualize the generated traversal loop.
- **Planned path**: visualize the current A* route.
- **Arrow keys / touch controls / swipe**: steer in human mode.
- **A**: watch AI, **U**: switch play mode, **P**: pause/resume, **R**: restart, **S**: settings, **Escape**: close settings.
- **H**: temporarily show the cycle, **Space**: hold to boost.

Snake 2.0 is the full-screen AI Snake playground. Keyboard hints appear directly on the floating toolbar.

The original gameplay, AI safety heuristic, world wrapping, and automatic reset behavior are intentionally retained.

---

# How AI Snake works?
This is simpler than simple. Yup! it is. It is just AI and mathematics(The God of fear fears this subject).

Why this is the perfect AI-Snake? Because it never gets killed, of course not when there is no space on board for the snake to move. When a snake will never get killed? when it follows a cyclic path(Hamiltonian Cycle) which covers all the places on the board.

    * - * - * - * - * - *
    |                   |
    *   * - * - * - * - * 
    |   |
    *   * - * - * - * - * 
    |                   |
    *   * - * - * - * - * 
    |   |
    *   * - * - * - * - * 
    |                   |
    * - * - * - * - * - * 


If the snake follows the above path then no matter where the apple is, the snake will always win the game.

The problem with this is that a large number of moves are wasted. 

How to solve this?
Let's mark the path with numbers

    1 -- 2 -- 3 -- 4 -- 5 -- 6
    |                        |
    36  11 - 10 -- 9 -- 8 -- 7 
    |   |
    35  12 - 13 - 14 -- 15 - 16 
    |                        |
    34  21 - 20 - 19 -- 18 - 17 
    |   |
    33  22 - 23 - 24 -- 25 - 26 
    |                        |
    32 - 31 - 30 - 29 - 28 - 27

Now imagine the snake is at 7-8-9-10 and apple is at 15. If the snake follows the usual path then the snake head will move 10-11-12-13-14-15. But the better moves would have been 10-13-14-15. The snake would have saved 2 moves. This means the snake needs to take shortcuts to save moves so the time. 

Now let's say the snake head is at node A and the tail is at B. The Snake from node A can move to any of the 4 adjacent nodes i.e, A's neighbors. But there is a condition for the snake to move from A to C (one of the neighbors) is that the value of node C cannot lie in between the values of nodes A and B.

How will the snake decide which possible neighbor to take to reduce the number of moves? Here comes the infamous Artificial Intelligence. <strong>A* pathfinding algorthms</strong> is an AI technique to find the shortest path between the two points with obstacles present around.

To know the working of A* pathfinding Algorithm:
* https://www.youtube.com/watch?v=aKYlikFAV4k
* https://umangkumarr.github.io/aStar-grid/

---
## References

* https://www.youtube.com/watch?v=tjQIO1rqTBE ( idea )
* https://www.youtube.com/watch?v=TOpBcfbAgPg ( for insights )
* https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.35.3648&rep=rep1&type=pdf ( random hamiltonian cycle )
---



## Optimization checks

Run from the repository root (Node.js, no dependencies):

```bash
node tests/regression.cjs
node tests/benchmark.cjs
```

The regression checks cover circular body storage and occupancy consistency, shared path storage, human-mode apple handling, collision-before-victory ordering, original cycle-boundary fallback behavior, static overlay caching, and pause/resume rendering. The benchmark uses two seeded 100,000-move simulations on a 40×24 board. It measures game logic only; browser rendering, DOM, GPU, and actual FPS require browser profiling.

Body removal and occupancy queries take constant time. Search branches share immutable parent links instead of copying whole routes; selected routes are materialized for playback. The grid and Hamiltonian overlay are cached in an offscreen canvas, and paused games redraw only when needed.
