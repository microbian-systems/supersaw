Source: https://raw.githubusercontent.com/milkytracker/MilkyTracker/master/resources/reference/xm-form.txt

---

The "Complete" XM module format specification v0.81
=============================================

---

Compiled and written by Matti "ccr" Hamalainen of TNSP 2000-2001

Contact ccr/TNSP at:
e-mail: ccr@tnsp.org
www : http://www.tnsp.org/

## NEWS/CHANGES FROM V0.75

- Typofixes
- Info about Vibrato,
- Info about other programs than FT2 that support XM
  and discussion about how they differ from FT.
- Player processing info
- More info about other effects

## TO-DO LIST

- Research workings of the rest of the effects.
- Do a complete check of accuracy to this doc.
  (e.g. test all info that is said here.)

============================================================================

## DESCRIPTION

NOTICE: I DON'T claim that the information in this document is
errorfree, so use common sense if you encounter something that
does not match! I am constantly improving this doc, send your
reports to me and I'll see if I can figure out what went wrong. :)

This documentation was written due to lack of 'complete' guide to
the XM format. In 2000 I used the modified XM document by Sahara
Surfers when I started writing XM loader/player for "J Sound System".
It was good, but still lacked some crucial information. During the
development of J Sound System I have gathered some additional
information (and still continue to do so). This document is the
result of that work.

Remember - the information contained herein is based on tests on
REAL XM files and REAL FT2 :)

If you have any questions, fixes or suggestions (to add info about
something, for example), e-mail me.

============================================================================

## SOURCE MATERIAL AND ADDITIONAL CREDITS

- Lots of empirical and systematic testing in FT2. Hours and
  hours of "to-FT2-shell-to-DOS-write-doc-back-to-FT2-...",
  beer, coffee, swearing, XXX, etc.
- Investigating PT 3.61 internals.
- Testing of J Sound System's XM player.
- Testing of other players to see the common pitfalls ;)

This document is based on the original XM format description:
(C) Copyright 1994 by Mr.H of Triton productions
(Distributed in public domain)

Some information is from the enchanged XM description
written by Guru and Alfred of Sahara Surfers in 1995:
"Not copyrighted, released into public domain (at least the
additions by us). Feel free to do what you wish. Credits please."

Some bug information from ODE2PTK.MOD's documentation
written and gathered by Chipaux Sylvain aka Asle/Lithium^ReDoX

Greetings also to:

- My friends who have beared me talking about FT2's "features"
  and swearing the bugs in "Other Players", etc.

- All TNSP members: fgcl, mdx, sind., delfine, ssad.

- All demoscene people over the world, demo on! (But please
  try not to make 3D stuff only, it's boring :-)

============================================================================

## DISCLAIMER

You can use this information in any way you wish as long as it
is distributed freely and no payment is taken for distributing it
(maybe except a minimal fee for the physical copying process).
Also the authors may not be held responsible for anything
including but not excluding damages, loss of profit or similar.

This information is provided in hope that it is useful, but there
are no warranties of any kind that the information contained in
this document is in any way correct or usable. The responsibility
for consequences when using the information is entirely on the user.

============================================================================

---

- General layout \*

---

The layout of a typical XM is like this:

XM header (up to and excluding header size field, now 60 bytes)
Rest of the header (length including header size field)
Pattern 0 header (length in header)
Pattern 0 data (length in header)
Pattern 1 header (length in header)
Pattern 1 data (length in header)
... (_ number of patterns)
Instrument 0 header (length in size field is this and next one together)
if (numSample > 0)
Extra header
Sample 0 header (size in instrument extra header)
Sample 1 header (size in instrument extra header)
... (_ number of samples in instrument)
Sample 0 data (length in sample header)
Sample 1 data (length in sample header)
... (_ number of samples in instrument)
Instrument 1 header (length in size field is this and next one together)
... (_ number of instruments)

---

- The XM file structure: \*

---

# HEADER

Offset|Length| Type | Description
------+------+--------+--------------------------------------------
0 | 17 | (char) | ID text: 'Extended Module: '
| | | (The last character is space, i.e. $20)
17 | 20 | (char) | Module name, padded with zeros.
37 | 1 | (char) | Always $1a
38 | 20 | (char) | Tracker name
58 | 2 | (word) | Version number, hi-byte major and low-byte minor
| | | The current format is version $0104. Format
| | | versions below $0104 have a LOT of differences.
| | | Remember to check this field! Your loader will
| | | probably crash if you don't!
| | |
60 | 4 | (dword)| Header size
| | | Calculated FROM THIS OFFSET, NOT from
| | | the beginning of the file!
+4 | 2 | (word) | Song length (in pattern order table)
+6 | 2 | (word) | Song restart position
+8 | 2 | (word) | Number of channels (2, 4, 6, 8, 10, ..., 32)
+10 | 2 | (word) | Number of patterns (max 256)
| | | NOTICE: This might not include all patterns used!
| | | If empty patterns are used at the end of the song
| | | they are NOT saved to the file!!
+12 | 2 | (word) | Number of instruments (max 128)
+14 | 2 | (word) | Flags field:
| | | bit0: 0 = Amiga frequency table
| | | 1 = Linear frequency table
+16 | 2 | (word) | Default tempo
+18 | 2 | (word) | Default BPM
+20 | 256 | (byte) | Pattern order table

# PATTERNS

Offset|Length| Type | Description
------+------+--------+--------------------------------------------
? | 4 | (dword)| Pattern header length
+4 | 1 | (byte) | Packing type (always 0)
+5 | 2 | (word) | Number of rows in pattern (1..256)
+7 | 2 | (word) | Packed patterndata size
| | | << Note! This is zero if the pattern is
| | | completely empty and no pattern data
| | | follows! >>
| | |
? | ? | | Packed pattern data.

# INSTRUMENTS

Offset|Length| Type | Description
------+------+--------+--------------------------------------------
? | 4 | (dword)| Instrument HEADER size (SEE THE NOTICE BELOW)
+4 | 22 | (char) | Instrument name
+26 | 1 | (byte) | Instrument type (always 0)
| | | << In reality, this seems pretty random,
| | | so DON'T assume that it's zero. >>
| | |
+27 | 2 | (word) | Number of samples in instrument.

NOTICE: The "Instrument HEADER Size" field tends to be more than the actual
size of the structure documented here (it includes also the
extended instrument sample header below). So remember to check
it and skip the additional bytes before the first sample header!

If the number of samples is greater than zero, then this will follow:
(if it is zero, nothing will follow!)

Offset|Length| Type | Description
------+------+--------+--------------------------------------------
+29 | 4 | (dword)| Sample header size
+33 | 96 | (byte) | Sample number for all notes
+129 | 48 | (byte) | Points for volume envelope
+177 | 48 | (byte) | Points for panning envelope
+225 | 1 | (byte) | Number of volume points
+226 | 1 | (byte) | Number of panning points
+227 | 1 | (byte) | Volume sustain point
+228 | 1 | (byte) | Volume loop start point
+229 | 1 | (byte) | Volume loop end point
+230 | 1 | (byte) | Panning sustain point
+231 | 1 | (byte) | Panning loop start point
+232 | 1 | (byte) | Panning loop end point
+233 | 1 | (byte) | Volume type: bit 0: On; 1: Sustain; 2: Loop
+234 | 1 | (byte) | Panning type: bit 0: On; 1: Sustain; 2: Loop
+235 | 1 | (byte) | Vibrato type
+236 | 1 | (byte) | Vibrato sweep
+237 | 1 | (byte) | Vibrato depth
+238 | 1 | (byte) | Vibrato rate
+239 | 2 | (word) | Volume fadeout
+241 | 2 | (word) | Reserved

## Envelope format

The envelope-data (for both Volume and Panning envelope)
is formatted as follows:

Data for ONE envelope point:

Offset|Length| Type | Description
------+------+--------+--------------------------------------------
? | 1 | (word) | Frame number of the point (X-coordinate)
? | 1 | (word) | Value of the point (Y-coordinate)

Since one envelope point takes 2 words (2\*2 bytes), the total
maximum number of points in envelope is (48/4) = 12 points.
So in practice, you have:

#define MAX_ENVELOPE_POINTS 12

typedef {
WORD nframe;
WORD value;
} t_envelope_point;

t_envelope_point volume_envelope[MAX_ENVELOPE_POINTS];
t_envelope_point panning_envelope[MAX_ENVELOPE_POINTS];

Envelope frame-counters work in range 0..FFFFh (0..65535 dec).
BUT! FT2 only itself supports only range 0..FFh (0..255 dec).
Some other trackers (like SoundTracker for Unix), however, can
use the full range 0..FFFF, so it should be supported.

!!TIP: This is also a good way to detect if the module has been
made with FT2 or not. (In case the tracker name is brain-
deadly left unchanged!)

       Of course it does not help if all instruments have the
       values inside FT2 supported range.

The value-field of the envelope point is ranged between
00..3Fh (0..64 dec).

# SAMPLE HEADERS

"Number of samples" of these will follow after the instrument header.
See also the XM file general layout in the beginning of this file to
understand better/get the big picture.

Offset|Length| Type | Description
------+------+--------+--------------------------------------------
? | 4 | (dword)| Sample length
+4 | 4 | (dword)| Sample loop start
+8 | 4 | (dword)| Sample loop length
+12 | 1 | (byte) | Volume
+13 | 1 | (byte) | Finetune (signed byte -16..+15)
+14 | 1 | (byte) | Type of sample, bit meanings:
| | | 0-1: 00 = 0 dec = No loop,
| | | 01 = 1 dec = Forward loop,
| | | 11 = 2 dec = Ping-pong loop;
| | | 4: 16-bit sampledata
+15 | 1 | (byte) | Panning (0-255)
+16 | 1 | (byte) | Relative note number (signed byte)
+17 | 1 | (byte) | Reserved
+18 | 22 | (char) | Sample name

NOTICE: Note! After the instrument header the file contains
ALL sample headers for the instrument followed by the
sample data for all samples.

        Also note that it is possible that samples have loops with
        length zero. In that case the loops just have to be skipped.

## Sample data

Sample data is stored as signed values:

- 8-bit sample : char in C if char is 8bit, ShortInt in Pascal.
- 16-bit sample: int in C, Integer in Pascal.

The saved data uses simple delta-encoding to achieve better
compression ratios (when compressed with pkzip, etc.)

Pseudocode for converting the delta-coded data to normal data,
for 8-bit samples:

signed byte old, new;

old = 0;
for i = 0 to data_len {
new = sample[i] + old;
sample[i] = new;
old = new;
}

NOTICE: 16-bit samples are encoded in same way,
except that the datatype is 16-bit.

============================================================================

---

- Pattern format: \*

---

The patterns are stored as ordinary MOD patterns,
except that each note is stored as 5 bytes:

      ?      1   (byte) Note (1 - 96, 97 = KEY-OFF)
     +1      1   (byte) Instrument (1-128)
     +2      1	 (byte) Volume column byte (see below)
     +3      1	 (byte) Effect type
     +4      1	 (byte) Effect parameter

A simple packing scheme is also applied, so that the patterns do
not get TOO large: Since the MSB in the note value is never used,
it is used for the compression. If the bit is set, then the other
bits are interpreted as follows:

      bit 0 set: Note follows
      1 set: Instrument follows
      2 set: Volume column byte follows
      3 set: Effect follows
          4 set: Effect parameter follows

It is very simple, but far from optimal. If you want to get better
compression, you can always repack the patterns in your loader.

PSEUDOCODE:

...

dbyt = getbyte();

if (dbyt AND 0x80) {
if (dbyt AND 0x01) c_note = getbyte();
if (dbyt AND 0x02) c_inst = getbyte();
if (dbyt AND 0x04) c_vol = getbyte();
if (dbyt AND 0x08) c_effect = getbyte();
if (dbyt AND 0x10) c_param = getbyte();

     } else {
     c_note = dbyt;
     current_row++;
     }

...

============================================================================

---

- Player Processing: \*

---

This information is almost straight from XMP's technical
documents (see "other docs" section for more info), and
it explains how FT2 handles the different playing events:

Play = Play new note with new default volume
Switch = Play new note with current volume
OldVol = Don't play sample, set old default volume
Cut = Stop playing sample
Cont = Continue playing sample

                 ---------- INSTRUMENT -----------

Event | None | Same | Valid | Invalid
---------------+--------+--------+--------+----------------------
New Note | Switch | Play | Play | Cut (1)
New Instrument | - | OldVol | OldVol | OldVol
Tone Porta | Cont | OldVol | OldVol | OldVol

(1) This means that if There was NO instrument, FT2 Switches.
And if it is Same as currently playing instrument, FT2 Plays, etc.

============================================================================

---

- Instruments: \*

---

## INTRODUCTION

Instruments are a way to have more special control over playing of
the sample(s) and "combining" several samples into one "package"
that can be used in similar way to a normal sample. This means that,
numerous (16 in XM format) samples from one "realworld" instrument
could be taken in various pitches, and then, using instrument editor,
combined into a good simulation of the real-world one.

Why would you want to do that? You could have just one sample and
save memory? And the envelopes could be done with effect commands?

Yes, but many times it is much better to have several samples of one
real-world instrument since if just one sound sample is used, the
sound gets more distorted as the playing pitch gets further from the
original sampling pitch. Using envelopes gives more flexible and general
control of the instrument and you can still use the effects if you want.

This is just one reason for using instruments, there are many more
(tips: chiptunes, drumsets), just look around.

## IN XM-FORMAT

In XMs, a instrument combines a maximum of 16 samples to one
package with certain parameters. (NOTICE that the _internal_
representation in FT2 is not exactly same, you can notice that
by looking the value-ranges in here, sample-header structures
and in FT2's instrument editor...)

                           Value Range

- Instrument volume | 00..3F
- Panning | 00..FF
- Tuning | -128..127
- Fade-out | 000..FFF

- Auto-Vibrato:

  - Speed | 00..3F
  - Depth | 00..0F
  - Sweep | 00..FF (In other trackers may be 0..FFFF !)

- Envelopes:
  - Volume
  - Panning

All of these parameter settings apply to every sample in the
instrument. Envelopes and auto-vibrato are discussed further
in below.

---

- Volumes and envelopes: \*

---

First some mathematical stuff, explanations follow below...

# The volume formula

FinalVol = (FadeOutVol/65536)_(EnvelopeVol/64)_(GlobalVol/64)*(Vol/64)*Scale;

# The panning formula

FinalPan = Pan + ( (EnvelopePan-32)\*(128-Abs(Pan-128)) / 32 );

NOTICE: The panning envelope values range
from 0...64, not -128...+127

# Fadeout

The FadeOutVol is originally 65536 (after the note has been triggered) and
is decremented by "Instrument.Fadeout" each tick after note is released
(with KeyOff Effect or with KeyOff Note)

NOTICE: Fadeout is not processed if Volume Envelope is DISABLED.
(This means that the FadeOutVol stays at 65536)

        Panning Envelope does not affect Fadeout.

# Envelopes

An excerpt from original XM documentation:

> > The envelopes are processed once per frame, instead of every
> > frame where no new notes are read. This is also true for the
> > instrument vibrato and the fadeout. Since I am so lazy and the
> > tracker is rather self-explaining I am not going to write any
> > more for the moment.

## Introduction to envelopes

Envelopes are a simple, yet ingenious way to achieve more versatile
control over the instrument's volume/panning abilities with much
less effort than using conventional ways (effects, volume-changes).

Describing all the possibilities of envelopes (or instruments as whole!)
would be impossible effort! Envelopes and instruments have been widely
used in all imaginable and unimaginable ways in XMs... This is why it
is important to implement these features correctly in a module-player.

## General information

As stated above, envelopes are processed on each "frame". The
frame is quite much similar to our familiar friend "tick". Frames,
however, are separate from ticks and are only reset on "envelope
reset", whereas ticks are reset on every new row.

In practice, the envelope processing routine should increase a
"frame*counter" integer value for all envelopes (\_separately* for
both volume & panning envelopes!) and for every playing instrument.
This frame-counter is then used when interpolating between the
envelope points.

Envelope is reset (or "triggered") when:

- A new note is set
- A new instrument is set
- A Lxx-effect is issued (See Lxx-effect description below!!)
  (Lxx resets both envelopes, volume and panning.)

Envelope reset means that frame_counter of the envelope is
set to zero or other value (in case of Lxx), the envelope
is ACTIVATED and other possible internal values are initialized.

## PSEUDOCODE

!! NOTICE: SEE XM-structure descriptions in above sections for info on the
!! envelope-points!

if (envelope_enabled) then

PROCESS_ENVELOPE_FRAME:

frame_counter = 0..65535, triggered/reset appropriately.

current_point = [get the point number 0..MAX_ENVELOPE_POINTS-1
which has (nframe < frame_counter), BUT where
current_point+1 point has (nframe > frame_counter)
]

!! NOTICE: You don't need to worry about the first point's nframe-value,
!! it will be always ZERO. (If not, then it's a buggy module :-)

point_d = (env_pnts[current_point+1].nframe - env_pnts[current_point].nframe);
value_d = (env_pnts[current_point+1].value - env_pnts[current_point].value);

cval = (current_frame - env_pnts[current_point].nframe);

final_env_output = env_pnts[current_point].value +
((value_d \* cval) / point_d);

This is how it works approximately, the interpolation could be made
more efficient and you also have to take into account all the other
things about envelopes, like triggering, etc. <ADVERTISEMENT>
Check out J Sound System if you want to see how ;) </ADVERTISEMENT>

I'll try to write more about this when I feel so :-)

## Autovibrato

[Information about autovibrato may not be too accurate, I'll
try to fix this when I get my tests finished on this subject.]

The instrument autovibrato works like the normal vibrato effect,
except that it is applied on EVERY frame of instrument and uses
it's own parameters.

- Vibrato is applied even if envelope(s) are not enabled. This
  means that you need to do the autovibrato separately from
  envelope processing.

- The Vibrato Sweep is a parameter that describes the speed when
  the "full power of vibrato" is reached. After reaching the
  maximum value, it stays on it.

- It SEEMS (or rather like "hears") that the vibrato sweep actually
  stays on the value it had when KeyOff was received. I am not 100%
  sure about this, but I it really sounds like it. I have added this
  to the pseudocode below.

- Other parameters work as in normal vibrato effect.

This is the formula that I have developed for the vibrato
depth calculation:

Range definitions:
vib_speed = [0..3F]
vib_depth = [0..F]
vib_sweep = [0..FF]
curr_frame= [0..FFFF]

Calculations:

if (keyoff = FALSE) {
if (curr_frame < vib_sweep)
tmp = curr_frame;
else
tmp = vib_sweep;
}

final_depth = (tmp \* vib_depth) / vib_sweep;

[!!!!! NOT FINISHED YET !!!!!]

---

- Periods and frequencies: \*

---

PatternNote ranges in 1..96
1 = C-0
96 = B-7
97 = Key Off (special 'note')

FineTune ranges between -128..+127
-128 = -1 halftone,
+127 = +127/128 halftones

RelativeTone is then in range -96..95, so in
effect a note with RelativeTone value 0 is the
note itself.

Formula for calculating the real, final note value is:

> > RealNote = PatternNote + RelativeTone;

So the range of RealNote is 1..119, where

1 = C-0
119 = A#9

NOTICE: This is higher than the max for PatternNote (96)!

# Linear frequency table

The formulas for calculating period and frequency for
Linear frequency table, are as follows:

> Period = (10*12*16*4) - (Note*16*4) - (FineTune/2)
> Frequency = 8363*2^((6*12*16*4 - Period) / (12*16\*4))

Which naturally can be simplified to:

> Period = 7680 - (Note _ 64) - (FineTune / 2)
> Frequency = 8363 _ 2^((4608 - Period) / 768)

NOTICE: The values are reasonable. With note 119
and finetune of +128, we get:

    > x = 7680 - (119*64) - (128/2)
    > x = 64 - 64
    > x = 0

# Amiga frequency table

The formulas for calculating period and frequency for
Amiga (logarithmic) frequency table, are as follows:

Period = (PeriodTab[(Note MOD 12)*8 + FineTune/16]*(1-Frac(FineTune/16)) +
PeriodTab[(Note MOD 12)*8 + FineTune/16]*(Frac(FineTune/16)))
*16/2^(Note DIV 12);

(The period is interpolated for finer finetune values)

Frequency = 8363\*1712/Period;

<< NOTICE FROM Sahara Surfers:

The interpolation code above doesn't work because of several reasons:

    1. It does not interpolate. (Try adding 1 to the
       PeriodTab index in the second line)

    2. It may go past the table beginning for negative
       finetune values.

Write your own interpolation routine instead - it's not that hard.

> >

PeriodTab = Array[0..12*8-1] of Word = (
907,900,894,887,881,875,868,862,856,850,844,838,832,826,820,814,
808,802,796,791,785,779,774,768,762,757,752,746,741,736,730,725,
720,715,709,704,699,694,689,684,678,675,670,665,660,655,651,646,
640,636,632,628,623,619,614,610,604,601,597,592,588,584,580,575,
570,567,563,559,555,551,547,543,538,535,532,528,524,520,516,513,
508,505,502,498,494,491,487,484,480,477,474,470,467,463,460,457);

<< Note! The period table is made for 1-based note numbers, so in
practise it contains the period values for B-3 to G#4. Fun. >>

---

- Standard effects: \*

---

##| Eff | Info | Description
--+-----+------+------------------------------
00: 0 | | Arpeggio
01: 1 | (_) | Porta up
02: 2 | (_) | Porta down
03: 3 | (_) | Tone porta
04: 4 | (_) | Vibrato
05: 5 | (_) | Tone porta+Volume slide
06: 6 | (_) | Vibrato+Volume slide
07: 7 | (_) | Tremolo
08: 8 | | Set panning
09: 9 | | Sample offset
10: A | (_) | Volume slide
11: B | | Position jump
12: C | | Set volume
13: D | | Pattern break
14: E1 | (_) | Fine porta up
--: E2 | (_) | Fine porta down
--: E3 | | Set gliss control
--: E4 | | Set vibrato control
--: E5 | | Set finetune
--: E6 | | Set loop begin/loop
--: E7 | | Set tremolo control
--: E9 | | Retrig note
--: EA | (_) | Fine volume slide up
--: EB | (_) | Fine volume slide down
--: EC | | Note cut
--: ED | | Note delay
--: EE | | Pattern delay
15: F | | Set tempo/BPM
16: G | | Set global volume
17: H | (_) | Global volume slide
20: K | | Key off (Also note number 97)
21: L | | Set envelope position
24: P | (_) | Panning slide
26: R | (_) | Multi retrig note
28: T | | Tremor
31: X1 | (_) | Extra fine porta up
--: X2 | (\*) | Extra fine porta down

(\*) = If the effect PARAMETER byte is zero, the last nonzero
byte for the effect should be used. (This means that the
effect "remembers" it's parameters!)

      This also applies to E1x/E2x, EAx/EBx, X1x/X2x, where the
      "x" is checked for zero, if it is zero, then use last non-zero.

      SEE ALSO THE INDIVIDUAL EFFECT NOTES BELOW!
      (For more information and bugs + specialties)

In general, the commands are reasonably Protracker compatible
although not all PT "features" (some might call them replay
routine bugs) are implemented.

---

- Effect descriptions: \*

---

This is the effect info section. All the information contained
here is based on my (ccr) experiments on FT2 and XM format.
I have only added notes for the effects that need some attention,
the ones left out should be implemented as in PT MOD.

## 1xx - Porta up (\*)

Bends the frequency of channel/sample UP by PERIODS.

NOTICE! Parameters (and their saved values) are SEPARATE from
values of effect 2xx (Porta down) and 3xx (Tone porta)!!

## 2xx - Porta down (\*)

Bends the frequency of channel/sample DOWN by PERIODS.

NOTICE! Parameters (and their saved values) are SEPARATE from
values of effect 1xx (Porta up) and 3xx (Tone porta)!!

## 3xx - Tone porta (\*)

Bends the frequency of channel/sample to the given
and saved note value by PERIODS.

NOTICE#1! Parameters (and their saved values) are SEPARATE from
values of effect 1xx (Porta up) and 2xx (Porta down)!!

NOTICE#2! If a new note is got, but porta speed (parameter) is
0, the new note is ignored.

NOTICE#3! The NOTICE#2 also applies to new instrument number!
(This does not work as in Impulse Tracker!)

SEE ALSO: Volume column Tone porta.

## 4xy - Vibrato (\*)

SEE ALSO: Volume column vibrato.

--------------------========================
5xx - Tone porta+Volume slide (_)
6xx - Vibrato+Volume slide (_)
7xy - Tremolo (\*)
8xx - Set panning
--------------------========================

## 9xx - Sample offset (\*)

Set sample offset to parameter \* 256 units (aka bytes
or 16-bit words, depending on the sample format).

NOTICE#1! Unlike stated in original XM documentation, this
effect DOES remember it's parameters, aka last non-zero
parameter is used.

NOTICE#2! If there is no instrument set on the same row,
this effect is ignored:

C-4 01 -- 950 >> Plat from offset 256*50H <--+
... .. -- 000 |
C-4 01 -- 000 >> Play from offset 0 |
... .. -- 000 |
C-4 01 -- 900 >> Play from offset 256*50H ---+
... .. -- 910 >> No instrument, 9xx IGNORED! |
C-4 01 -- 900 >> Play from offset 256\*50H ---+

## Axy - Volume slide (\*)

Remembers it's parameters, but is NOT connected
with the volume column effect volume slides.

SEE ALSO: Volume column Volume slide.

## Cxx - Set volume

The volume column effects are not supported by this command,
so don't use the same routine as the "main" volume setting
for this (IF you use that for vol.col. effect checking too!).

## Dxx - Pattern break

Works like in S3M/MOD. The parameter is in BCD format,
and the final row for jump is calculated as follows:

    jump_to_row = (paramY*10 + paramX)

## E1x - Fine portamento Up

...

## E2x - Fine portamento Down

...

## E6x - Set loop begin/loop

This effect may SEEM TO USUALLY work, BUT:

1. If a loop is set on pattern N in row R (with E60), and no
   pattern jump/break effects are used after that, FT2 will
   start playing the next pattern (N+1) from row R instead
   of row 0!

   a) Pattern Jump and Pattern Break reset this. Bug only
   occurs if PJ or PB have NOT been used.

   a) Affects also MOD-files made with FT2! So MOD-players
   should also support this "feature".

   [Tested with: 2.04, 2.06 and 2.08]

2. If two or more pattern loop commands are on the same row
   (on different channels), strange behaviour occur: FT2 may
   jump to a random row, or perform the loop random times or
   even do the effect right, but at least v2.08 did all these
   just randomly without any reproducable pattern!

   NOTICE: This is a REAL BUG in FT2 and the working of the
   effects is random and cannot be reproduced. (So you don't
   need to bother to implement this.)

   NOTICE TO TRACKERS: Avoid using two or more Pattern Loops
   on same row as this effect is buggy and results are undefined!
   (It may first SEEM that it works right, but try to play it
   5-10 times [with Play Song/Play Pattern] and you will see that
   it does strange things.)

   [Tested with: 2.06 and 2.08]

ADDITIONAL: The Loop Position is NOT zeroed when the pattern
changes, so if set to row X previously, and on some other pattern
does not re-set it, a loop effect will loop to the same row.

(In Scream Tracker 3 S3M-format, the loop-position is reset to 0
always when the pattern changes! Impulse Tracker [2.14 at least] is
similar to FT2, it also uses the latest parameter.)

## E9x - Retrig note

...

## EEx - Pattern delay

This effect works otherwise normally, BUT:

FT2 simply forgets to play/update other effects on
the row when there's a Pattern Delay:

01|--- -- EB1|--- -- EE5|...

The Fine Volume Slide Down (EB1) won't be played here,
thought it should be updated five times (EE5)!

[Tested with: 2.04, 2.06 and 2.08]

## Fxx - Set Speed / Tempo

if (Param > 0) then
if (Param <= $1F)
then Speed = Param;
else Tempo = Param;

As you notice, a zero parameter should be ignored.

## Kxx - Key Off ( also note number 97 )

The parameter of this effect does not have any meaning.
(At least any that I would be aware of)

This effect does the same as note-number 97 dec, in practice,
it "releases" the virtual "key" or note. See description of
Instruments and Envelopes above for more info.

## Lxx - Set envelope position

Set the current position in the envelopes to FRAME
number XX, between 00-FFh. (See also Envelope-description
section for more information)

This command also re-triggers the ENVELOPES (not the note/sample
though), so if the envelope had stopped, it will be reset (and
set to the given offset position.)

UNKNOWN: (TO-DO-list)

- Does it reset other than framepos? (e.g. fadeout?)

## Pxx - Panning slide (\*)

...

## Rxx - Multi retrig note (\*)

...

## Txx - Tremor

...

---

- Effects in volume column: \*

---

All effects in the volume column should work as the standard effects.
The volume column is interpreted before the standard effects, so
some standard effects may override volume column effects.

Value | Meaning
---------+-----------------------------
0 | Do nothing
$10-$50 | Set volume (Value-$10)
:    |     :         :
:    |     :         :
$60-$6f | Volume slide down
$70-$7f | Volume slide up
$80-$8f | Fine volume slide down
$90-$9f | Fine volume slide up
$a0-$af | Set vibrato speed
$b0-$bf | Vibrato
$c0-$cf | Set panning
$d0-$df | Panning slide left
$e0-$ef | Panning slide right
$f0-$ff | Tone porta

---

- Volume column effect descriptions: \*

---

Here are some notes on the volume column effects:
(See also the WARNINGS in the normal effect explanation section!)

1. Volume slides (normal and fine) DO NOT remember
   their parameters and are NOT connected with the
   "normal volume effects". Examples:

   C-4 01 -- 000 >> Starts playing inst #1 at C-4
   ... .. -1 000 >> Lowers volume of channel by 1
   ... .. -0 000 >> Does not do ANYTHING!
   ... .. -- 000 >>

   The above applies to all volume column volume slide effects.

2. Vibrato effect DOES REMEMBER it's parameters and
   IS connected (shares saved parameters) with
   "normal effect vibrato". Examples:

   C-4 01 S5 000 >> S5 sets vibrato speed to 5
   ... .. V1 000 >> V1 starts vibrating with speed 5 and depth of 1
   ... .. V0 000 >> continues vibrating witht depth of 1
   ... .. V0 000 >> and same as above..
   ... .. 00 400 >> !! still vibrates with same params!
   ... .. 00 400 >> !! and same as above..
   ... .. V0 400 >> !! _doubles_ the vibration (as expected)

   This means that volume column effects "Sx" with "Vy" are
   equal to normal effect "4xy"!

3. Tone portamento effect DOES REMEMBER it's parameters and
   IS connected (shares saved parameters) with "normal porta
   effect" parameter. (See also notes about the effect 3xx!)
   Examples:

   C-4 01 -- 000 >> Starts playing inst #1 at C-4
   ... .. -- 000
   C-6 01 M1 000 >> M1 starts bending to C-6 with speed of 1
   ... .. -- 000
   ... .. M0 000 >> continues bending to C-6 with speed of 1
   ... .. -- 000
   ... .. -- 300 >> !! continues bending to C-6 with speed of 1

   This means that volume column effect "Mx" is
   equal to normal effect "30x"!

---

- Bugs/Features of FT2 \*

---

There are few known "features" in FT2's player system, which
could be considered "bugs", but since we are thinking only
about playing an XM correctly, they should be considered features
which need to be implemented.

Here's a list of these features:

- Pattern Loop replay features.
  See description of effect E6x for more information.

- Pattern Delay replay feature.
  See description of effect EEx for more information.

Here is a list of REAL BUGS which should be attributed
by the FastTracker 2 maintainers:

- Effect parameters not initialized/zeroed when playing starts.

  During my tests on FT2 I found out that on effects that "remember"
  their parameters (e.g. save the previous non zero parameter), FT2
  DOES NOT CLEAR THE SAVE VALUES when it starts playing!
  This means that if you use this kind effect with zero before using
  non zero value on that effect and channel, results are UNDEFINED!
  This may affect the playing of some modules! (Tested on FT2.08/2.06)

- Bugs in Pattern Loop effect.
  See description of effect E6x for more information.

---

- Other trackers and detecting \*

---

Aside from the programs mentioned here, there are number of conversion
utilities and other trackers that are capable of saving to XM-format.
Some of those don't do it properly and might set the identification
tags (TrackerName, format version) identical to FT2, etc.

## SoundTracker

An "FT2 clone" for Unixes, a GNU GPL licensed tracker running
under X Window System and Gtk+ toolkit. Supports at least x86
based platforms.

Platform : Linux and other UNIX-type OS
Author : Michael Krause
Available : http://www.soundtracker.org/
TrackerName TAG: "rst's SoundTracker "
(last empty characters are spaces, ASCII 32 dec)

Provides also extra effects:
Qxx - Set LP Filter Resonance
Zxx - Set LP Filter Cut-Off Frequency

These effects are also supported by OpenCP player, from which the
player code has been taken from to SoundTracker. (More info about
these effects can be got from SoundTracker and/or OpenCP sourcecode
which are available under GNU GPL license)

## DigiTrakker

A quite tracker in it's own, Shareware. I don't know whether it
is maintained anymore.

Platform : DOS (at least)
Author : prodatron/n-Factor
Available : ??? (search the Internet)
TrackerName TAG: Changes

This is a quite special case. DigiTrakker misuses the TrackerName
TAG and puts the name of the composer there, if there is any set.
This behavior makes it very hard to detect XMs made with DigiTrakker.

## IT2XM

Not really a tracker, but a Impulse Tracker (.IT) to XM
format converter.

Platform : DOS
Author : Andy Voss (Phoenix/Hornet)
Available : ???
TrackerName TAG: Identical to FT2

Due to differences in IT's XM-replay and differences in IT/XM
formats in general, it is not possible to accurately replay
an converted XM. And since the trackername-tag is identical to
FT2's, abandon all hope...

---

- Other documents? \*

---

I highly recommend that you also read other material available,
even the ones for other formats since they might help you to understand
the design choices behind FT2. Here is a list of docs I have read and
found useful in creation of JSS and this document:

- Extended Module Player (XMP)'s technical documents
  by Claudio Matsuoka and Hipolito Carraro Jr.
  [http://xmp.helllabs.org/]
- Firelight's (Brett Paterson) FMODDOC (and FS3MDOC)
- ProTracker 2.1A player source and v3.61 format documentation.
- And of course the documents mentioned in the "credits"
  section of this file. They contained valuable information
  that I used as a very basis of this doc.

Thanks to the writers of above docs, it would not have been possible
to write JSS or this doc without you!

All the documents are available at the J Sound System's homepage:
http://jss.sf.net/moddoc/

---

- Final Words \*

---

That's it. 'nuff said. Too much talk, far too less deeds done.

Questions? Send me some e-mail.
