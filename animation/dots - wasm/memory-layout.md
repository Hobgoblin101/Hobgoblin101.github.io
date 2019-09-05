| Offset | Name | Type | Details
|-:|:-|:-:|:-|
| 0  | count | i32 | Number of boids
| 4  | width | i32 | Screen width
| 8  | height | i32 | Screen height
| 12 | factorGroup | f32 | Cohesion factor
| 16 | factorAvoid | f32 | Avoiding factor
| 20 | factorAlign | f32 | Aligning factor
| 24 | flock | i32 | The flocking range
| 28 | avoid | i32 | The avoid range
| 32 | movSpeed | f32 | Movement speed
| 36 | turnSpeed | f32 | Turning speed (d^2)
| - | - | - | -
| n*16 + 40 + 0 | posX | i32
| n*16 + 40 + 4 | posY | i32
| n*16 + 40 + 8 | velX | f32
| n*16 + 50 + 12 | velY | f32
