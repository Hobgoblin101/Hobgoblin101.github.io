(module
	(memory (import "env" "mem") 1)

	(import "env" "log"
		(func $logi (param i32))
	)
	(import "env" "log"
		(func $logi2 (param i32) (param i32))
	)
	(import "env" "log"
		(func $logf2 (param f32) (param f32))
	)
	(import "env" "drawBoid"
		(func $DrawBoid (param i32) (param i32))
	)
	(import "env" "drawAim"
		(func $DrawAim (param i32) (param i32) (param f32) (param f32))
	)
	(global $header (import "env" "header") i32)
	(import "env" "drawConnection"
		(func $DrawConnection (param i32) (param i32) (param i32) (param i32))
	)
	(export "update" (func $Update))
	(export "draw" (func $Draw))



	(func $Update
		(param $dt f32)

		(local $ptr i32)
		(local $current i32)
		(local $count i32)


		;; cache the number of boids
		(set_local $count
			(i32.load (i32.const 0))
		)

		;; ptr to first boid
		(set_local $ptr (get_global $header))

		;; for loop (i < $count)
		(block $break
			(loop $top
				;; End loop
				(br_if
					$break
					(i32.eq (get_local $current) (get_local $count) )
				)

				(call $UpdateBoid (get_local $dt) (get_local $ptr) (get_local $current) )

				;; Itterate loop
				(set_local $current (i32.add (get_local $current) (i32.const 1)))
				(set_local $ptr (i32.add (get_local $ptr) (i32.const 16)))
				(br $top)
			)
		)
	)

	(func $Draw
		(param $dt f32)

		(local $ptr i32)
		(local $current i32)
		(local $count i32)


		;; cache the number of boids
		(set_local $count
			(i32.load (i32.const 0))
		)

		;; ptr to first boid
		(set_local $ptr (get_global $header))

		;; for loop (i < $count)
		(block $break
			(loop $top
				;; End loop
				(br_if
					$break
					(i32.eq (get_local $current) (get_local $count) )
				)

				(call $DrawBoid
					(i32.load (get_local $ptr))
					(i32.load (i32.add
						(i32.const 4)
						(get_local $ptr)
					))
				)

				;; Itterate loop
				(set_local $current (i32.add (get_local $current) (i32.const 1)))
				(set_local $ptr (i32.add (get_local $ptr) (i32.const 16)))
				(br $top)
			)
		)
	)


	(func $UpdateBoid
		(param $dt f32)
		(param $boidPtr i32)
		(param $boidID i32)

		(local $otherPtr i32)
		(local $current i32)
		(local $count i32)

		(local $dist i32)
		(local $mag f32)
		(local $avgVecX f32)
		(local $avgVecY f32)
		(local $alignVecX f32)
		(local $alignVecY f32)
		(local $avoidVecX f32)
		(local $avoidVecY f32)

		(local $maxConnections i32)


		;; Set the number of maximum connections
		(set_local $maxConnections (i32.const 3))

		;; cache the number of boids
		(set_local $count
			(i32.load (i32.const 0))
		)

		;; ptr to first boid
		(set_local $otherPtr (get_global $header))

		;; for loop (i < $count)
		(block $break
			(loop $top
				;; End loop
				(br_if
					$break
					(i32.eq (get_local $current) (get_local $count) )
				)

				;; If this boid is itself
				(if (i32.eq
					(get_local $boidPtr)
					(get_local $otherPtr)
				) (then
					;; Itterate loop
					(set_local $current (i32.add (get_local $current) (i32.const 1)))
					(set_local $otherPtr (i32.add (get_local $otherPtr) (i32.const 16)))
					(br $top)
				))



				;; Get average flock position
				(set_local $dist
					(call $GetDist2 (get_local $boidPtr) (get_local $otherPtr))
				)
				(if (i32.le_s
					(get_local $dist)
					(i32.load (i32.const 24))
				) (then

					;; Don't draw a connection twice
					(if (i32.gt_s
						(get_local $current)
						(get_local $boidID)
					) (then
						;; Only draw a set number of connections per point
						(if (i32.gt_s
							(get_local $maxConnections)
							(i32.const 0)
						) (then
							(call $DrawConnection
								(i32.load (get_local $boidPtr))
								(i32.load (i32.add (get_local $boidPtr) (i32.const 4)))
								(i32.load (get_local $otherPtr))
								(i32.load (i32.add (get_local $otherPtr) (i32.const 4)))
							)

							(set_local $maxConnections (i32.sub
								(get_local $maxConnections)
								(i32.const 1)
							))
						))
					))


					;; Add flock member relative position to tally
					(set_local $avgVecX (f32.add
						(get_local $avgVecX)
						(f32.convert_s/i32
							(i32.sub
								(i32.load (get_local $otherPtr))
								(i32.load (get_local $boidPtr))
							)
						)
					))
					(set_local $avgVecY (f32.add
						(get_local $avgVecY)
						(f32.convert_s/i32
							(i32.sub
								(i32.load (i32.add (get_local $otherPtr) (i32.const 4)))
								(i32.load (i32.add (get_local $boidPtr) (i32.const 4)))
							)
						)
					))


					;; Add flock member alignment to tally
					(set_local $alignVecX (f32.add
						(get_local $alignVecX)
						(f32.load (i32.add (get_local $otherPtr) (i32.const 8)))
					))
					(set_local $alignVecX (f32.add
						(get_local $alignVecX)
						(f32.load (i32.add (get_local $otherPtr) (i32.const 12)))
					))
				))

				;; Get avoidance direction
				(if (i32.le_s
					(get_local $dist)
					(i32.load (i32.const 28))
				) (then

					(set_local $dist (i32.sub
						(i32.load (i32.const 28))
						(get_local $dist)
					))

					(set_local $avoidVecX
						(f32.add
							(get_local $avoidVecX)
							(f32.convert_s/i32
								(i32.mul
									(i32.sub
										(i32.load (get_local $boidPtr))
										(i32.load (get_local $otherPtr))
									)
									(get_local $dist)
								)
							)
						)
					)
					(set_local $avoidVecY
						(f32.add
							(get_local $avoidVecY)
							(f32.convert_s/i32
								(i32.mul
									(i32.sub
										(i32.load (i32.add (get_local $boidPtr) (i32.const 4)))
										(i32.load (i32.add (get_local $otherPtr) (i32.const 4)))
									)
									(get_local $dist)
								)
							)
						)
					)
				))

				;; Itterate loop
				(set_local $current (i32.add (get_local $current) (i32.const 1)))
				(set_local $otherPtr (i32.add (get_local $otherPtr) (i32.const 16)))
				(br $top)
			)
		)

		;; Normalise Average
		(set_local $mag (f32.mul
			(call $GetMagnitude (get_local $avgVecX) (get_local $avgVecY))
			(f32.const 1)
		))
		(if (f32.eq
			(get_local $mag)
			(f32.const 0)
		) (then) (else
			(set_local $avgVecX
				(f32.div
					(get_local $avgVecX)
					(get_local $mag)
				)
			)
			(set_local $avgVecY
				(f32.div
					(get_local $avgVecY)
					(get_local $mag)
				)
			)
		))

		;; Normalise Avoid
		(set_local $mag (f32.mul
			(call $GetMagnitude (get_local $avoidVecX) (get_local $avoidVecY))
			(f32.const 1) ;; weight by 1x
		))
		(if (f32.eq
			(get_local $mag)
			(f32.const 0)
		) (then) (else
			(set_local $avoidVecX
				(f32.div
					(get_local $avoidVecX)
					(get_local $mag)
				)
			)
			(set_local $avoidVecY
				(f32.div
					(get_local $avoidVecY)
					(get_local $mag)
				)
			)
		))

		;; Normalise Align
		(set_local $mag (f32.mul
			(call $GetMagnitude (get_local $alignVecX) (get_local $alignVecY))
			(f32.const 2) ;; weight by 0.5x
		))
		(if (f32.eq
			(get_local $mag)
			(f32.const 0)
		) (then) (else
			(set_local $alignVecX
				(f32.div
					(get_local $alignVecX)
					(get_local $mag)
				)
			)
			(set_local $alignVecY
				(f32.div
					(get_local $alignVecY)
					(get_local $mag)
				)
			)
		))


		(set_local $avgVecX (f32.add
				(get_local $avgVecX)
				(get_local $avoidVecX)
		))
		(set_local $avgVecY (f32.add
				(get_local $avgVecY)
				(get_local $avoidVecY)
		))
		(set_local $avgVecX (f32.add
				(get_local $avgVecX)
				(get_local $alignVecX)
		))
		(set_local $avgVecY (f32.add
				(get_local $avgVecY)
				(get_local $alignVecY)
		))

		;; Normalise Aim
		(set_local $mag (call $GetMagnitude (get_local $avgVecX) (get_local $avgVecY)) )
		(if (f32.eq
			(get_local $mag)
			(f32.const 0)
		) (then) (else
			(set_local $avgVecX
				(f32.div
					(get_local $avgVecX)
					(get_local $mag)
				)
			)
			(set_local $avgVecY
				(f32.div
					(get_local $avgVecY)
					(get_local $mag)
				)
			)
		))


		;; Apply turning speed
		(set_local $avgVecX (f32.add
			(get_local $avgVecX)
			(f32.mul
				(f32.load (i32.const 36))
				(get_local $dt)
			)
		))
		(set_local $avgVecY (f32.add
			(get_local $avgVecY)
			(f32.mul
				(f32.load (i32.const 36))
				(get_local $dt)
			)
		))



		;; Apply desire to velocity
		(f32.store
			(i32.add (get_local $boidPtr) (i32.const 8))
			(get_local $avgVecX)
		)
		(f32.store
			(i32.add (get_local $boidPtr) (i32.const 12))
			(get_local $avgVecY)
		)

		;; Normalise velocity
		(set_local $mag (call $GetMagnitude
			(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
			(f32.load (i32.add (get_local $boidPtr) (i32.const 12)))
		))
		(if (f32.eq
			(get_local $mag)
			(f32.const 0)
		) (then) (else
			(f32.store
				(i32.add (get_local $boidPtr) (i32.const 8))
				(f32.div
					(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
					(get_local $mag)
				)
			)
			(f32.store
				(i32.add (get_local $boidPtr) (i32.const 12))
				(f32.div
					(f32.load (i32.add (get_local $boidPtr) (i32.const 12)))
					(get_local $mag)
				)
			)
		))




		;; move boid based on velocity

		(i32.store
			(get_local $boidPtr)
			(i32.add
				(i32.load (get_local $boidPtr))
				(i32.trunc_s/f32
					(f32.mul
						(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
						(f32.mul
							(get_local $dt)
							(f32.load (i32.const 32))
						)
					)
				)
			)
		)
		(i32.store
			(i32.add (i32.const 4) (get_local $boidPtr))
			(i32.add
				(i32.load (i32.add (i32.const 4) (get_local $boidPtr)))
				(i32.trunc_s/f32
					(f32.mul
						(f32.load (i32.add (get_local $boidPtr) (i32.const 12)))
						(f32.mul
							(get_local $dt)
							(f32.load (i32.const 32))
						)
					)
				)
			)
		)


		;; Screen wrapping

		;; travelled off left side of the screen
		(if (i32.gt_s
			(i32.load (get_local $boidPtr))
			(i32.load (i32.const 4))
		) (then
			(f32.store (i32.add (get_local $boidPtr) (i32.const 8))
				(f32.mul
					(f32.const -2)
					(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
				)
			)
			(i32.store(get_local $boidPtr)
				(i32.load (i32.const 4))
			)
		))
		;; travelled off the right side of the screen
		(if (i32.lt_s
			(i32.load (get_local $boidPtr))
			(i32.const 0)
		) (then
			(f32.store (i32.add (get_local $boidPtr) (i32.const 8))
				(f32.mul
					(f32.const -2)
					(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
				)
			)
			(i32.store(get_local $boidPtr) (i32.const 0) )
		))
		;; travelled off the top of the screen
		(if (i32.lt_s
			(i32.load (i32.add (get_local $boidPtr) (i32.const 4)))
			(i32.const 0)
		) (then
			(i32.store (i32.add (i32.const 4) (get_local $boidPtr))
				(i32.const 0)
			)
			(f32.store (i32.add (get_local $boidPtr) (i32.const 8))
				(f32.mul
					(f32.const -2)
					(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
				)
			)
		))
		;; travelled off the bottom of the screen
		(if (i32.gt_s
			(i32.load (i32.add (get_local $boidPtr) (i32.const 4)))
			(i32.load (i32.const 8))
		) (then
			(i32.store (i32.add (i32.const 4) (get_local $boidPtr))
				(i32.load (i32.const 8))
			)
			(f32.store (i32.add (get_local $boidPtr) (i32.const 8))
				(f32.mul
					(f32.const -2)
					(f32.load (i32.add (get_local $boidPtr) (i32.const 8)))
				)
			)
		))
	)


	;; Returns squared distance between positions
	(func $GetDist2
		(param $posA i32)
		(param $posB i32)
		(result i32)

		(local $a i32)
		(local $b i32)

		(set_local $a
			(i32.sub
				(i32.load (get_local $posA))
				(i32.load (get_local $posB))
			)
		)
		(set_local $a (i32.mul (get_local $a) (get_local $a)) )

		(set_local $b
			(i32.sub
				(i32.load (i32.add (get_local $posA) (i32.const 4)))
				(i32.load (i32.add (get_local $posB) (i32.const 4)))
			)
		)
		(set_local $b (i32.mul (get_local $b) (get_local $b)) )

		(return
			(i32.add
				(get_local $a)
				(get_local $b)
			)
		)
	)

	(func $GetMagnitude
		(param $x f32)
		(param $y f32)
		(result f32)

		(return
			(f32.sqrt (f32.add
				(f32.mul
					(get_local $x)
					(get_local $x)
				)
				(f32.mul
					(get_local $y)
					(get_local $y)
				)
			))
		)
	)


)
