// license:GPL_2.0
// copyright-holders:Robbbert
#include "../mame/drivers/pcktgal.cpp"

ROM_START( pckgalgr )
	ROM_REGION( 0x10000, "maincpu", 0 )
	ROM_LOAD( "eb04gr.rom",   0x0000, 0x10000, CRC(9a7a826c) SHA1(f0c62a760cc05e31568723eaf354a735c28d20ab) )

	ROM_REGION( 0x10000, "audiocpu", 0 )
	ROM_LOAD( "eb03.f2",   0x0000, 0x10000, CRC(cb029b02) SHA1(fbb3da08ed05ae73fbeeb13e0e2ff735aaf83db8) )

	ROM_REGION( 0x20000, "chars", 0 )
	ROM_LOAD( "eb01gr.rom",   0x00000, 0x10000, CRC(9e5e5743) SHA1(3379bcd36148c37bfc8d2eb2909104b367797856) )
	ROM_LOAD( "eb02gr.rom",   0x10000, 0x10000, CRC(be11227c) SHA1(c41b10f23ce60829a40851ad024e189bc7e5b07c) )

	ROM_REGION( 0x10000, "sprites", 0 )
	ROM_LOAD( "eb00gr.rom",   0x00000, 0x10000, CRC(5eeb40e8) SHA1(703b2b87954032a383c6f34316df2b5ec6a59488) )

	ROM_REGION( 0x0400, "proms", 0 )
	ROM_LOAD( "eb05.k14",     0x0000, 0x0200, CRC(3b6198cb) SHA1(d32b364cfce99637998ca83ad21783f80364dd65) )
	ROM_LOAD( "eb06.k15",     0x0200, 0x0200, CRC(1fbd4b59) SHA1(84e20329003cf09b849b49e1d83edc330d49f404) )
ROM_END

ROM_START( pcktgalk )
	ROM_REGION( 0x10000, "maincpu", 0 )
	ROM_LOAD( "eb04.j7",   0x0000, 0x10000, CRC(8215d60d) SHA1(ac26dfce7e215be21f2a17f864c5e966b8b8322e) )

	ROM_REGION( 0x10000, "audiocpu", 0 )
	ROM_LOAD( "eb03.f2",   0x0000, 0x10000, CRC(cb029b02) SHA1(fbb3da08ed05ae73fbeeb13e0e2ff735aaf83db8) )

	ROM_REGION( 0x20000, "chars", 0 )
	ROM_LOAD( "eb01k.rom",   0x00000, 0x10000, CRC(3b9f8e29) SHA1(b7ae6d72b9fc1f4964b673346d76a9d24cd5606c) )
	ROM_LOAD( "eb02.d12",   0x10000, 0x10000, CRC(a9dcd339) SHA1(245824ab86cdfe4b842ce1be0af60f2ff4c6ae07) )

	ROM_REGION( 0x10000, "sprites", 0 )
	ROM_LOAD( "eb00.a1",   0x00000, 0x10000, CRC(6c1a14a8) SHA1(03201197304c5f1d854b8c4f4a5c78336b51f872) )

	ROM_REGION( 0x0400, "proms", 0 )
	ROM_LOAD( "eb05.k14",     0x0000, 0x0200, CRC(3b6198cb) SHA1(d32b364cfce99637998ca83ad21783f80364dd65) )
	ROM_LOAD( "eb06.k15",     0x0200, 0x0200, CRC(1fbd4b59) SHA1(84e20329003cf09b849b49e1d83edc330d49f404) )
ROM_END


GAME( 1987, pckgalgr, pcktgal, pcktgal, pcktgal, pcktgal_state, init_original,  ROT0, "GreekRoms", "Pocket Gal (Greek)", MACHINE_SUPPORTS_SAVE )
GAME( 1987, pcktgalk, pcktgal, pcktgal, pcktgal, pcktgal_state, init_original,  ROT0, "Aneue Bannzai", "Pocket Gal (Korean)", MACHINE_SUPPORTS_SAVE )

