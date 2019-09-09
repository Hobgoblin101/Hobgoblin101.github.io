(module
	(memory (import "env" "mem") 1)

	(import "env" "log"
		(func $logi (param i32))
	)
	(import "env" "log"
		(func $logi2 (param i32) (param i32))
	)
	(import "env" "log"
		(func $logi4 (param i32) (param i32) (param i32) (param i32))
	)
	(import "env" "log"
		(func $logf4 (param f32) (param f32) (param f32) (param f32))
	)
	(import "env" "log"
		(func $logf2 (param f32) (param f32))
	)


	(import "env" "sin"
		(func $MathSin (param f32) (result f32))
	)
	(import "env" "cos"
		(func $MathCos (param f32) (result f32))
	)



	(import "env" "DrawParticle"
		(func $DrawParticle (param i32) (param i32) (param f32) (param f32))
	)

	(global $posHeader (import "env" "posHeader") i32)
	(global $posFreq (import "env" "posFreq") i32)
	(global $posParticle (import "env" "posParticle") i32)
	(global $strucParticle (import "env" "strucParticle") i32)


	(export "update" (func $Update))



	(func $Update
		(param $dt f32)

		(local $ptr i32)
		(local $current i32)
		(local $count i32)


		;; cache the number of boids
		(set_local $count
			(i32.load (get_global $posHeader))
		)

		;; ptr to first boid
		(set_local $ptr (get_global $posParticle))

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
				(set_local $ptr (i32.add (get_local $ptr) (get_global $strucParticle)))
				(br $top)
			)
		)
	)


	(func $GetFreq
		(param $index i32)
		(result f32)

		(local $freq f32)

		(set_local $freq (f32.convert_s/i32
			(i32.load8_u
				(i32.add
					(get_global $posFreq)
					(get_local $index)
				)
			)
		))

		(set_local $freq (f32.div
			(get_local $freq)
			(f32.const 256)
		))

		;; (if (i32.ge
		;; 	(get_local $index)
		;; 	(i32.load (get_local $posHeader) (i32.const 24))
		;; ) (then
		;; 	(call $logi2 (get_local $index) (get_local $freq))
		;; ))

		(return (get_local $freq))
	)

	(func $GetFreqFromCoord
		(param $x i32)
		(param $y i32)
		(result f32)

		(local $freq i32)
		(local $index i32)

		(set_local $y (i32.mul
			(get_local $y)
			(i32.load (i32.add
				(get_global $posHeader)
				(i32.const 28)
			))
		))
		(set_local $index (i32.add
			(get_local $y)
			(get_local $x)
		))

		(return	(call $GetFreq (get_local $index)))
	)


	(func $lerpf
		(param $a f32)
		(param $b f32)
		(param $percent f32)
		(result f32)

		(return (f32.add
			(f32.mul
				(f32.sub
					(get_local $b)
					(get_local $a)
				)
				(get_local $percent)
			)
			(get_local $a)
		))
	)


	(func $UpdateBoid
		(param $dt f32)
		(param $particlePtr i32)
		(param $particleID i32)

		(local $height f32)
		(local $locX i32)
		(local $locY i32)
		(local $velX f32)
		(local $velY f32)

		(local $offX f32)
		(local $offY f32)

		(local $freqA f32)
		(local $freqB f32)
		(local $freqC f32)
		(local $freqD f32)

		(local $tX i32)
		(local $tY i32)


		;; Load point position
		(set_local $locX (i32.load (get_local $particlePtr)))
		(set_local $locY (i32.load (i32.add (get_local $particlePtr) (i32.const 4))))


		;; Down scale location to frequency grid (round down)
		(set_local $tX (i32.div_u
			(get_local $locX)
			(i32.div_u
				(i32.load (i32.add (get_global $posHeader) (i32.const 4)) )
				(i32.load (i32.add (get_global $posHeader) (i32.const 28)) )
			)
		))
		(set_local $tY (i32.div_u
			(get_local $locY)
			(i32.div_u
				(i32.load (i32.add (get_global $posHeader) (i32.const 8)) )
				(i32.load (i32.add (get_global $posHeader) (i32.const 28)) )
			)
		))


		;; tX/Y is the quad the point is in

		;; Get frequency quad
		(set_local $freqA (call $GetFreqFromCoord
			(get_local $tX)
			(get_local $tY)
		))
		(set_local $freqB (call $GetFreqFromCoord
			(i32.add (get_local $tX) (i32.const 1))
			(get_local $tY)
		))
		(set_local $freqC (call $GetFreqFromCoord
			(get_local $tX)
			(i32.add (get_local $tY) (i32.const 1))
		))
		(set_local $freqD (call $GetFreqFromCoord
			(i32.add (get_local $tX) (i32.const 1))
			(i32.add (get_local $tY) (i32.const 1))
		))



		;; Offset in freq quad as int
		(set_local $tX (i32.sub
			(get_local $locX)
			(i32.mul
				(get_local $tX)
				(i32.div_u
					(i32.load (i32.add (get_global $posHeader) (i32.const 4)) )
					(i32.load (i32.add (get_global $posHeader) (i32.const 28)) )
				)
			)
		))
		(set_local $tY (i32.sub
			(get_local $locY)
			(i32.mul
				(get_local $tY)
				(i32.div_u
					(i32.load (i32.add (get_global $posHeader) (i32.const 8)) )
					(i32.load (i32.add (get_global $posHeader) (i32.const 28)) )
				)
			)
		))

		;; Offset in freq quad as percent
		(set_local $offX (f32.div
			(f32.convert_s/i32 (get_local $tX))
			(f32.div
				(f32.convert_s/i32 (i32.load (i32.add (get_global $posHeader) (i32.const 4))  )) ;; canvas width
				(f32.convert_s/i32 (i32.load (i32.add (get_global $posHeader) (i32.const 28)) )) ;; number of quads in row
			)
		))
		(set_local $offY (f32.div
			(f32.convert_s/i32 (get_local $tY))
			(f32.div
				(f32.convert_s/i32 (i32.load (i32.add (get_global $posHeader) (i32.const 8))  )) ;; canvas height
				(f32.convert_s/i32 (i32.load (i32.add (get_global $posHeader) (i32.const 28)) )) ;; number of quads in row
			)
		))

		;; Get height
		(set_local $height (call $lerpf
			(call $lerpf
				(get_local $freqA)
				(get_local $freqB)
				(get_local $offX)
			)
			(call $lerpf
				(get_local $freqC)
				(get_local $freqD)
				(get_local $offX)
			)
			(get_local $offY)
		))


		(set_local $velX (f32.sub
			(call $lerpf
				(get_local $freqB)
				(get_local $freqD)
				(get_local $offY)
			)
			(call $lerpf
				(get_local $freqA)
				(get_local $freqC)
				(get_local $offY)
			)
		))
		(set_local $velY (f32.sub
			(call $lerpf
				(get_local $freqC)
				(get_local $freqD)
				(get_local $offX)
			)
			(call $lerpf
				(get_local $freqA)
				(get_local $freqB)
				(get_local $offX)
			)
		))


		;; Apply movement speed
		(set_local $velX (f32.mul
			(f32.load (i32.add (get_global $posHeader) (i32.const 20)))
			(f32.mul
				(get_local $velX)
				(get_local $dt)
			)
		))
		(set_local $velY (f32.mul
			(f32.load (i32.add (get_global $posHeader) (i32.const 20)))
			(f32.mul
				(get_local $velY)
				(get_local $dt)
			)
		))


		;; Move particles
		(set_local $locX ( i32.add
			(get_local $locX)
			(i32.trunc_s/f32 (get_local $velX))
		))
		;; (set_local $locY ( i32.add
		;; 	(get_local $locY)
		;; 	(i32.trunc_s/f32 (get_local $velY))
		;; ))



		;; Wrap particles around the screen

		;; travelled off left side of the screen
		;; (if (i32.gt_s
		;; 	(get_local $tX)
		;; 	(i32.load (i32.add (get_global $posHeader) (i32.const 4)))
		;; ) (then
		;; 	(set_local $tX (i32.const 0))
		;; ))
		;; ;; travelled off the right side of the screen
		;; (if (i32.lt_s
		;; 	(get_local $tX)
		;; 	(i32.const 0)
		;; ) (then
		;; 	(set_local $tX (i32.load (i32.add (get_global $posHeader) (i32.const 4))))
		;; ))
		;; ;; travelled off the bottom of the screen
		;; (if (i32.gt_s
		;; 	(get_local $tY)
		;; 	(i32.load (i32.add (get_global $posHeader) (i32.const 8)))
		;; ) (then
		;; 	(set_local $tY (i32.const 0))
		;; ))
		;; ;; travelled off the top of the screen
		;; (if (i32.lt_s
		;; 	(get_local $tY)
		;; 	(i32.const 0)
		;; ) (then
		;; 	(set_local $tY (i32.load (i32.add (get_global $posHeader) (i32.const 8))))
		;; ))



		;; Write new particle positions
		(i32.store
			(get_local $particlePtr)
			(get_local $locX)
		)
		(i32.store
			(i32.add (get_local $particlePtr) (i32.const 4))
			(get_local $locY)
		)


		(call $DrawParticle
			(i32.load (get_local $particlePtr))
			(i32.load (i32.add
				(get_local $particlePtr)
				(i32.const 4)
			))
			(get_local $height)
			(f32.div
				(f32.add
					(get_local $velX)
					(get_local $velY)
				)
				(f32.const 2)
			)
		)
	)
)
