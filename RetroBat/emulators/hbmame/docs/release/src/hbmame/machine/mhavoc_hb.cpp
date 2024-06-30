// license:BSD-3-Clause
// copyright-holders:Mike Appolo
/***************************************************************************

    Atari Major Havoc hardware

***************************************************************************/

#include "emu.h"
#include "cpu/m6502/m6502.h"
#include "includes/mhavoc_hb.h"


/*************************************
 *
 *  Interrupt handling
 *
 *************************************/

TIMER_DEVICE_CALLBACK_MEMBER(mhavoc_hbmame::mhavoc_cpu_irq_clock)
{
	/* clock the LS161 driving the alpha CPU IRQ */
	if (m_alpha_irq_clock_enable)
	{
		m_alpha_irq_clock++;
		if ((m_alpha_irq_clock & 0x0c) == 0x0c)
		{
			m_alpha->set_input_line(0, ASSERT_LINE);
			m_alpha_irq_clock_enable = 0;
		}
	}

	/* clock the LS161 driving the gamma CPU IRQ */
	if (m_has_gamma_cpu)
	{
		m_gamma_irq_clock++;
		m_gamma->set_input_line(0, (m_gamma_irq_clock & 0x08) ? ASSERT_LINE : CLEAR_LINE);
	}
}


void mhavoc_hbmame::mhavoc_alpha_irq_ack_w(uint8_t data)
{
	/* clear the line and reset the clock */
	m_alpha->set_input_line(0, CLEAR_LINE);
	m_alpha_irq_clock = 0;
	m_alpha_irq_clock_enable = 1;
}


void mhavoc_hbmame::mhavoc_gamma_irq_ack_w(uint8_t data)
{
	/* clear the line and reset the clock */
	m_gamma->set_input_line(0, CLEAR_LINE);
	m_gamma_irq_clock = 0;
}

/*************************************
 *
 *  Machine init
 *
 *************************************/

void mhavoc_hbmame::machine_start()
{
	m_lamps.resolve();

	save_item(NAME(m_alpha_data));
	save_item(NAME(m_alpha_rcvd));
	save_item(NAME(m_alpha_xmtd));
	save_item(NAME(m_gamma_data));
	save_item(NAME(m_gamma_rcvd));
	save_item(NAME(m_gamma_xmtd));
	save_item(NAME(m_player_1));
	save_item(NAME(m_alpha_irq_clock));
	save_item(NAME(m_alpha_irq_clock_enable));
	save_item(NAME(m_gamma_irq_clock));

	save_item(NAME(m_speech_write_buffer));
}


void mhavoc_hbmame::machine_reset()
{
	m_has_gamma_cpu = (m_gamma != nullptr);
	m_has_beta_cpu = (m_beta != nullptr);

	membank("bank1")->configure_entry(0, m_zram0);
	membank("bank1")->configure_entry(1, m_zram1);
	membank("bank2")->configure_entries(0, 8, memregion("alpha")->base() + 0x10000, 0x2000);
	if (memregion("bank3"))
		membank("bank3")->configure_entries(0, 4, memregion("avg")->base(), 0x2000);

	/* reset RAM/ROM banks to 0 */
	mhavoc_ram_banksel_w(0);
	mhavoc_rom_banksel_w(0);

	/* reset alpha comm status */
	m_alpha_data = 0;
	m_alpha_rcvd = 0;
	m_alpha_xmtd = 0;

	/* reset gamma comm status */
	m_gamma_data = 0;
	m_gamma_rcvd = 0;
	m_gamma_xmtd = 0;

	/* reset player 1 flag */
	m_player_1 = 0;

	/* reset IRQ clock states */
	m_alpha_irq_clock = 0;
	m_alpha_irq_clock_enable = 1;
	m_gamma_irq_clock = 0;
	
}



/*************************************
 *
 *  Alpha -> gamma communications
 *
 *************************************/

TIMER_CALLBACK_MEMBER(mhavoc_hbmame::delayed_gamma_w)
{
	/* mark the data received */
	m_gamma_rcvd = 0;
	m_alpha_xmtd = 1;
	m_alpha_data = param;

	/* signal with an NMI pulse */
	m_gamma->pulse_input_line(INPUT_LINE_NMI, attotime::zero);

	/* the sound CPU needs to reply in 250microseconds (according to Neil Bradley) */
	machine().scheduler().timer_set(attotime::from_usec(250), timer_expired_delegate());
}


void mhavoc_hbmame::mhavoc_gamma_w(uint8_t data)
{
	//logerror("  writing to gamma processor: %02x (%d %d)\n", data, m_gamma_rcvd, m_alpha_xmtd);
	machine().scheduler().synchronize(timer_expired_delegate(FUNC(mhavoc_hbmame::delayed_gamma_w),this), data);
}


uint8_t mhavoc_hbmame::mhavoc_alpha_r()
{
	//logerror("\t\t\t\t\treading from alpha processor: %02x (%d %d)\n", m_alpha_data, m_gamma_rcvd, m_alpha_xmtd);
	m_gamma_rcvd = 1;
	m_alpha_xmtd = 0;
	return m_alpha_data;
}


/*************************************
 *
 *  Gamma -> alpha communications
 *
 *************************************/

void mhavoc_hbmame::mhavoc_alpha_w(uint8_t data)
{
	//logerror("\t\t\t\t\twriting to alpha processor: %02x %d %d\n", data, m_alpha_rcvd, m_gamma_xmtd);
	m_alpha_rcvd = 0;
	m_gamma_xmtd = 1;
	m_gamma_data = data;
}


uint8_t mhavoc_hbmame::mhavoc_gamma_r()
{
	//logerror("  reading from gamma processor: %02x (%d %d)\n", m_gamma_data, m_alpha_rcvd, m_gamma_xmtd);
	m_alpha_rcvd = 1;
	m_gamma_xmtd = 0;
	return m_gamma_data;
}



/*************************************
 *
 *  RAM/ROM banking
 *
 *************************************/

void mhavoc_hbmame::mhavoc_ram_banksel_w(uint8_t data)
{
	membank("bank1")->set_entry(data & 1);
}


void mhavoc_hbmame::mhavoc_rom_banksel_w(uint8_t data)
{
	membank("bank2")->set_entry(data & 3);
}



/*************************************
 *
 *  Input ports
 *
 *************************************/

CUSTOM_INPUT_MEMBER(mhavoc_hbmame::coin_service_r)
{
	return (m_player_1 ? m_service : m_coin)->read() & 0x01;
}

CUSTOM_INPUT_MEMBER(mhavoc_hbmame::coin_cabinet_l)
{
    return (m_player_1 ? (m_cabinet->read()) : (m_coin->read() >> 1));
}

READ_LINE_MEMBER(mhavoc_hbmame::gamma_rcvd_r)
{
	/* Gamma rcvd flag */
	return m_gamma_rcvd;
}

READ_LINE_MEMBER(mhavoc_hbmame::gamma_xmtd_r)
{
	/* Gamma xmtd flag */
	return m_gamma_xmtd;
}

READ_LINE_MEMBER(mhavoc_hbmame::gamma_tirdy_r)
{
	return m_tms->readyq_r();
}

READ_LINE_MEMBER(mhavoc_hbmame::alpha_rcvd_r)
{
	/* Alpha rcvd flag */
	return (m_has_gamma_cpu && m_alpha_rcvd);
}

READ_LINE_MEMBER(mhavoc_hbmame::alpha_xmtd_r)
{
	/* Alpha xmtd flag */
	return (m_has_gamma_cpu && m_alpha_xmtd);
}

/*************************************
 *
 *  Output ports
 *
 *************************************/

void mhavoc_hbmame::mhavoc_out_0_w(uint8_t data)
{
	/* Bit 7 = Invert Y -- unemulated */
	/* Bit 6 = Invert X -- unemulated */
	/* Bit 5 = Player 1 */
	m_player_1 = (data >> 5) & 1;

	/* Bit 3 = Gamma reset */
	if (m_gamma)
		m_gamma->set_input_line(INPUT_LINE_RESET, (data & 0x08) ? CLEAR_LINE : ASSERT_LINE);
	if (!(data & 0x08))
	{
		//logerror("\t\t\t\t*** GAMMA processor RESET Cleared. ***\n");
		m_alpha_rcvd = 0;
		m_alpha_xmtd = 0;
		m_gamma_rcvd = 0;
		m_gamma_xmtd = 0;
	}

	/* Bit 2 = Beta reset */
	/* this is the unpopulated processor in the corner of the pcb farthest from the quad pokey, not used on shipping boards */
	if (m_beta)
		m_beta->set_input_line(INPUT_LINE_RESET, (data & 0x04) ? CLEAR_LINE : ASSERT_LINE);

	
	/* Bit 0 = Roller light (Blinks on fatal errors) */
	m_lamps[0] = BIT(data, 0);
}


void mhavoc_hbmame::alphaone_out_0_w(uint8_t data)
{
	/* Bit 5 = P2 lamp */
	m_lamps[0] = BIT(~data, 5);

	/* Bit 4 = P1 lamp */
	m_lamps[1] = BIT(~data, 4);

	/* Bit 1 = right coin counter */
	machine().bookkeeping().coin_counter_w(1, data & 0x02);

	/* Bit 0 = left coin counter */
	machine().bookkeeping().coin_counter_w(0, data & 0x01);

	//logerror("alphaone_out_0_w(%02X)\n", data);
}


void mhavoc_hbmame::mhavoc_out_1_w(uint8_t data)
{
	/* Bit 1 = left coin counter */
	machine().bookkeeping().coin_counter_w(0, data & 0x02);

	/* Bit 0 = right coin counter */
	machine().bookkeeping().coin_counter_w(1, data & 0x01);
}

/*************************************
 *
 *  Speech access
 *
 *************************************/

void mhavoc_hbmame::mhavocrv_speech_data_w(uint8_t data)
{
	m_speech_write_buffer = data;
}


void mhavoc_hbmame::mhavocrv_speech_strobe_w(uint8_t data)
{
	m_tms->data_w(m_speech_write_buffer);
}


