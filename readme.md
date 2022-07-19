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

## Contribute
I would appreciate it if you could correct my grammar mistakes.

