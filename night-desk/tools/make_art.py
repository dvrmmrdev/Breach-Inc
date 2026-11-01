"""Act divider art for Breach Inc.: Outage, in the first game's noir style:
800x360, an oval fade at the edges, flat silhouettes in the game's greys,
gold for warm light, blue for sky, and at most one small red accent."""
import math
import os
import random

OUT = r"D:\devtools\breach-inc-outage\art"
BG, PANEL, LINE, EDGE = "#0d1117", "#161b22", "#21262d", "#30363d"
LIGHT, MUTED, GOLD, BLUE, RED = "#c9d1d9", "#8b949e", "#f2cc60", "#58a6ff", "#f85149"

FADE = '''<radialGradient id="fadeg" cx="0.5" cy="0.5" r="0.5"><stop offset="0.62" stop-color="#c9d1d9" stop-opacity="1"/><stop offset="1" stop-color="#c9d1d9" stop-opacity="0"/></radialGradient>
<mask id="fade" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="360" mask-type="alpha"><rect width="800" height="360" fill="url(#fadeg)"/></mask>
<radialGradient id="glowGold" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#f2cc60" stop-opacity="0.5"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0"/></radialGradient>
<radialGradient id="glowWhite" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#c9d1d9" stop-opacity="0.45"/><stop offset="1" stop-color="#c9d1d9" stop-opacity="0"/></radialGradient>
<radialGradient id="glowRed" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#f85149" stop-opacity="0.5"/><stop offset="1" stop-color="#f85149" stop-opacity="0"/></radialGradient>
<linearGradient id="coneGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2cc60" stop-opacity="0.55"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0"/></linearGradient>
<linearGradient id="coneWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d1d9" stop-opacity="0.35"/><stop offset="1" stop-color="#c9d1d9" stop-opacity="0"/></linearGradient>
<linearGradient id="beamLeft" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#f2cc60" stop-opacity="0.5"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0"/></linearGradient>'''


def svg(label, defs, body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 360" width="800" height="360" role="img" aria-label="%s">\n'
            '<defs>\n%s\n%s\n</defs>\n<g mask="url(#fade)">\n%s\n</g>\n</svg>\n') % (label, FADE, defs, body)


def glow(cx, cy, rx, ry, kind="Gold", opacity=1):
    return '<ellipse cx="%g" cy="%g" rx="%g" ry="%g" fill="url(#glow%s)" opacity="%g"/>' % (cx, cy, rx, ry, kind, opacity)


def rect(x, y, w, h, fill, extra=""):
    return '<rect x="%g" y="%g" width="%g" height="%g" fill="%s"%s/>' % (x, y, w, h, fill, extra)


def figure(x, ground, h=46, fill=BG):
    """A standing silhouette, feet on `ground`, centred on x."""
    s = h / 46
    pts = [(-3, -34), (-9, -31), (-8, -14), (-6, 0), (6, 0), (8, -14), (9, -31), (3, -34)]
    d = "M" + " L".join("%g %g" % (x + px * s, ground + py * s) for px, py in pts) + " Z"
    return '<g fill="%s"><circle cx="%g" cy="%g" r="%g"/><path d="%s"/></g>' % (fill, x, ground - 40 * s, 5 * s, d)


# ---------------------------------------------------------------- Act 0
def act0():
    defs = '''<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="232"><stop offset="0" stop-color="#0d1117" stop-opacity="0"/><stop offset="0.45" stop-color="#58a6ff" stop-opacity="0.16"/><stop offset="0.82" stop-color="#58a6ff" stop-opacity="0.32"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0.42"/></linearGradient>
<radialGradient id="sun" gradientUnits="userSpaceOnUse" cx="540" cy="146" r="46"><stop offset="0" stop-color="#c9d1d9"/><stop offset="0.7" stop-color="#f2cc60"/><stop offset="1" stop-color="#f2cc60"/></radialGradient>
<linearGradient id="ground" gradientUnits="userSpaceOnUse" x1="0" y1="232" x2="0" y2="360"><stop offset="0" stop-color="#21262d"/><stop offset="1" stop-color="#21262d" stop-opacity="0"/></linearGradient>
<clipPath id="skyclip"><rect x="0" y="0" width="800" height="232"/></clipPath>'''
    b = [rect(0, 0, 800, 232, "url(#sky)")]
    # Thin cloud streaks, as in the first game.
    for x, y, w in [(110, 96, 210), (460, 80, 240), (70, 132, 170), (540, 120, 190)]:
        b.append(rect(x, y, w, 3, LIGHT, ' rx="1.5" opacity="0.07"'))
    # A low sun behind the depot, and its halo.
    b.append('<g clip-path="url(#skyclip)">' + glow(540, 146, 260, 130, "Gold", 0.9) +
             '<circle cx="540" cy="146" r="46" fill="url(#sun)"/></g>')
    # The distant town, far left.
    x = 20
    random.seed(4)
    while x < 150:
        w = random.randint(14, 26)
        h = random.randint(20, 54)
        b.append(rect(x, 232 - h, w, h, LINE))
        x += w + 3
    # Ground.
    b.append(rect(0, 232, 800, 128, "url(#ground)"))
    # The depot: a long, low warehouse with a roof line catching the light.
    b.append(rect(150, 150, 520, 82, PANEL))
    b.append(rect(150, 150, 520, 3, EDGE))
    b.append('<path d="M150 150 L170 132 L650 132 L670 150 Z" fill="%s"/>' % LINE)
    b.append(rect(360, 138, 100, 10, EDGE, ' rx="1"'))  # the blank sign
    # Loading bays: some lit, with a trailer backed into each lit one.
    bays = [(178, True), (238, False), (298, True), (358, True), (418, False), (478, True), (538, False), (598, True)]
    for bx, lit in bays:
        if lit:
            b.append(glow(bx + 20, 232, 46, 14, "Gold", 0.9))
            b.append(rect(bx, 186, 40, 46, GOLD, ' opacity="0.85"'))
            b.append(rect(bx + 2, 196, 36, 36, BG))  # the trailer's back, filling the door
            b.append(rect(bx + 2, 196, 36, 2, EDGE))
        else:
            b.append(rect(bx, 186, 40, 46, BG))
            for i in range(5):
                b.append(rect(bx, 189 + i * 9, 40, 1, LINE))  # roller-door slats
    # Yard lamps.
    for lx in (110, 712):
        b.append('<path d="M%g %g L%g %g L%g %g L%g %g Z" fill="url(#coneGold)" opacity="0.6"/>' % (lx - 4, 168, lx + 4, 168, lx + 40, 300, lx - 40, 300))
        b.append(rect(lx - 1.5, 166, 3, 136, EDGE))
        b.append(rect(lx - 7, 163, 14, 5, LIGHT, ' rx="2"'))
    # Lorries on the road home, headlights on, heading for the depot.
    def lorry(x, y, s):
        out = []
        out.append('<path d="M%g %g L%g %g L%g %g L%g %g Z" fill="url(#beamLeft)"/>' % (x, y + 20 * s, x - 150 * s, y + 6 * s, x - 150 * s, y + 40 * s, x, y + 26 * s))
        out.append(rect(x, y, 26 * s, 30 * s, LINE, ' rx="%g"' % (3 * s)))            # cab
        out.append(rect(x + 3 * s, y + 4 * s, 12 * s, 9 * s, EDGE))                    # windscreen side
        out.append(rect(x + 28 * s, y - 10 * s, 120 * s, 40 * s, PANEL))               # trailer
        out.append(rect(x + 28 * s, y - 10 * s, 120 * s, 2 * s, EDGE))
        for wx in (10, 52, 120, 136):
            out.append('<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x + wx * s, y + 32 * s, 6 * s, BG))
        out.append('<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x + 1 * s, y + 23 * s, 2.2 * s, GOLD))
        return "".join(out)
    b.append(rect(0, 300, 800, 2, LINE))  # the road's edge
    b.append(lorry(440, 262, 0.95))
    b.append(lorry(640, 258, 0.72))
    # A lone figure in the yard, with a long shadow towards us.
    b.append('<path d="M250 252 L244 300 L258 300 L254 252 Z" fill="%s" opacity="0.5"/>' % BG)
    b.append(figure(252, 252, 30))
    return svg("A distribution depot at dusk: loading bays lit gold, lorries heading home with their headlights on, a lone figure in the yard",
               defs, "\n".join(b))


# ---------------------------------------------------------------- Act 1
def act1():
    defs = '''<linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#161b22"/></linearGradient>
<linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="360"><stop offset="0" stop-color="#161b22"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<linearGradient id="spill" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#f2cc60" stop-opacity="0.35"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0"/></linearGradient>'''
    b = [rect(0, 0, 800, 200, "url(#wall)"), rect(0, 200, 800, 160, "url(#floor)")]
    # Bunting left over from the thank-you, sagging across the top.
    for (x0, x1, sag) in [(60, 400, 26), (400, 740, 22)]:
        n = 11
        pts = []
        for i in range(n + 1):
            t = i / n
            x = x0 + (x1 - x0) * t
            y = 22 + sag * 4 * t * (1 - t)
            pts.append((x, y))
        b.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="1"/>' % (" ".join("%g,%g" % p for p in pts), EDGE))
        for i in range(n):
            (ax, ay), (bx, by) = pts[i], pts[i + 1]
            mx, my = (ax + bx) / 2, (ay + by) / 2
            b.append('<path d="M%g %g L%g %g L%g %g Z" fill="%s" opacity="%g"/>' % (ax + 2, ay, bx - 2, by, mx, my + 14, EDGE if i % 2 else LINE, 0.9))
    # The wall of screens at the front: dead, except the one with the note.
    for r in range(2):
        for c in range(3):
            x, y = 262 + c * 94, 52 + r * 58
            b.append(rect(x, y, 88, 52, BG, ' stroke="%s" stroke-width="2"' % EDGE))
            b.append('<path d="M%g %g L%g %g" stroke="%s" stroke-width="6" opacity="0.5"/>' % (x + 10, y + 46, x + 40, y + 8, LINE))  # a reflection
    nx, ny = 356, 110
    b.append(glow(nx + 44, ny + 26, 120, 60, "White", 0.7))
    b.append(rect(nx, ny, 88, 52, "#05070a", ' stroke="%s" stroke-width="2"' % EDGE))
    for i, w in enumerate([52, 66, 58]):
        b.append(rect(nx + 8, ny + 8 + i * 7, w, 2.5, LIGHT, ' opacity="0.85"'))
    b.append(glow(nx + 30, ny + 38, 30, 10, "Red", 0.9))
    b.append(rect(nx + 8, ny + 33, 44, 8, RED, ' rx="1"'))  # the timer
    # Rows of desks with dead monitors, receding.
    rows = [(196, 22, 15, 26, 0.55), (232, 32, 22, 38, 0.75), (286, 48, 32, 56, 1.0)]
    random.seed(7)
    for y, mw, mh, step, op in rows:
        b.append(rect(40, y, 720, 4 * op + 1, EDGE, ' opacity="%g"' % op))
        x = 60
        while x < 740:
            lit = random.random() < 0.12
            b.append(rect(x, y - mh - 4, mw, mh, "#05070a" if lit else BG, ' stroke="%s" stroke-width="1" opacity="%g"' % (EDGE, op + 0.1)))
            b.append(rect(x + mw / 2 - 1.5, y - 4, 3, 4, EDGE))
            if lit:
                b.append(glow(x + mw / 2, y - mh / 2 - 4, mw, mh, "White", 0.35))
                for i in range(3):
                    b.append(rect(x + 3, y - mh - 1 + i * (mh / 4), mw * (0.5 + 0.1 * i), 1.2 * op + 0.4, LIGHT, ' opacity="0.7"'))
            x += mw + step
    # The open door at the back, right, and you standing in its light.
    b.append(rect(704, 98, 48, 104, GOLD, ' opacity="0.8"'))
    b.append(glow(728, 150, 60, 70, "Gold", 0.8))
    b.append('<path d="M704 202 L752 202 L700 300 L560 300 Z" fill="url(#spill)" opacity="0.8"/>')
    b.append(figure(722, 202, 40))
    return svg("A dark operations floor: rows of dead screens, leftover bunting, a figure in a lit doorway, and one screen still showing a red timer",
               defs, "\n".join(b))


# ---------------------------------------------------------------- Act 2
def act2():
    defs = '''<linearGradient id="lamp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d1d9" stop-opacity="0.22"/><stop offset="1" stop-color="#c9d1d9" stop-opacity="0"/></linearGradient>'''
    b = [rect(0, 0, 800, 360, BG)]
    # A lamp over the table, lighting the whiteboard and the room.
    b.append('<path d="M392 0 L408 0 L620 330 L180 330 Z" fill="url(#lamp2)"/>')
    b.append(glow(400, 110, 300, 110, "White", 0.45))
    # The whiteboard, and the network drawn on it from memory.
    b.append(rect(150, 30, 500, 162, PANEL, ' stroke="%s" stroke-width="3"' % EDGE))
    random.seed(11)

    def wobble(x1, y1, x2, y2):
        mx, my = (x1 + x2) / 2 + random.uniform(-4, 4), (y1 + y2) / 2 + random.uniform(-4, 4)
        return '<path d="M%g %g Q%g %g %g %g" fill="none" stroke="%s" stroke-width="2" opacity="0.7"/>' % (x1, y1, mx, my, x2, y2, LIGHT)

    def box(x, y, w, h, label):
        out = ['<rect x="%g" y="%g" width="%g" height="%g" rx="3" fill="none" stroke="%s" stroke-width="2" opacity="0.75" transform="rotate(%g %g %g)"/>' % (
            x, y, w, h, LIGHT, random.uniform(-2, 2), x + w / 2, y + h / 2)]
        out.append(rect(x + 8, y + h / 2 - 1, label, 2, LIGHT, ' opacity="0.6"'))   # the scrawled name
        return "".join(out)
    hq = (360, 48, 80, 34)
    depots = [(190, 112, 70, 28), (365, 120, 70, 28), (540, 112, 70, 28)]
    for dx, dy, dw, dh in depots:
        b.append(wobble(400, 82, dx + dw / 2, dy))
    b.append(wobble(440, 64, 548, 66))   # to the backup store
    b.append(wobble(360, 64, 262, 62))   # out to the internet
    b.append(box(*hq, label=44))
    for d in depots:
        b.append(box(*d, label=36))
    # The internet: a scribbled cloud.
    b.append('<path d="M200 74 q-14 -2 -10 -14 q2 -14 18 -10 q8 -14 24 -6 q16 -6 22 8 q14 4 6 18 q-4 8 -18 6 q-12 8 -26 2 q-10 4 -16 -4 Z" fill="none" stroke="%s" stroke-width="2" opacity="0.6"/>' % LIGHT)
    # The backup store, drawn as a drum, crossed through in red: the one red.
    b.append('<path d="M548 52 L548 84 A22 7 0 0 0 592 84 L592 52" fill="none" stroke="%s" stroke-width="2" opacity="0.75"/>' % LIGHT)
    b.append('<ellipse cx="570" cy="52" rx="22" ry="7" fill="none" stroke="%s" stroke-width="2" opacity="0.75"/>' % LIGHT)
    b.append('<path d="M542 44 L600 96 M600 44 L542 96" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % RED)
    # Question marks and ticks beside the depots.
    for x, y in [(268, 120), (442, 128)]:
        b.append('<path d="M%g %g q0 -8 6 -8 q6 0 6 6 q0 5 -6 7 l0 4" fill="none" stroke="%s" stroke-width="2" opacity="0.6"/>' % (x, y, MUTED))
        b.append('<circle cx="%g" cy="%g" r="1.5" fill="%s" opacity="0.6"/>' % (x + 6, y + 14, MUTED))
    # People round the table, facing the board, seen from behind.
    for x, h, op in [(250, 96, 0.9), (318, 106, 1), (482, 104, 1), (552, 94, 0.9)]:
        b.append('<g fill="%s" opacity="%g"><circle cx="%g" cy="%g" r="15"/><path d="M%g 262 L%g %g Q%g %g %g %g L%g %g Q%g %g %g 262 Z"/></g>' % (
            BG, op, x, 262 - h + 15, x - 34, x - 30, 262 - h + 52, x - 30, 262 - h + 36, x - 12, 262 - h + 34, x + 12, 262 - h + 34, x + 30, 262 - h + 36, x + 34))
        # The board's light catching the edge of each head.
        b.append('<path d="M%g %g A15 15 0 0 1 %g %g" fill="none" stroke="%s" stroke-width="1.5" opacity="0.35"/>' % (x - 13, 262 - h + 8, x + 13, 262 - h + 8, LIGHT))
    # Someone at the board with a marker, pointing at a depot.
    b.append(figure(700, 300, 190, PANEL))
    b.append('<path d="M684 168 L626 132" stroke="%s" stroke-width="9" stroke-linecap="round"/>' % PANEL)
    # The table.
    b.append('<path d="M110 262 L690 262 L760 330 L40 330 Z" fill="%s"/>' % LINE)
    b.append(rect(110, 262, 580, 2, EDGE))
    # Printed sheets, cups and personal phones on the table.
    for x, y, r in [(330, 280, -6), (380, 286, 4), (440, 278, -2)]:
        b.append('<rect x="%g" y="%g" width="40" height="26" fill="%s" opacity="0.8" transform="rotate(%g %g %g)"/>' % (x, y, LIGHT, r, x + 20, y + 13))
        for i in range(3):
            b.append('<rect x="%g" y="%g" width="%g" height="1.5" fill="%s" transform="rotate(%g %g %g)"/>' % (x + 5, y + 6 + i * 6, 28 - i * 6, PANEL, r, x + 20, y + 13))
    for x in (180, 236, 590, 640):
        b.append('<path d="M%g 282 L%g 282 L%g 300 L%g 300 Z" fill="%s"/>' % (x, x + 16, x + 14, x + 2, EDGE))
    for x, y in [(520, 300), (260, 306)]:
        b.append(rect(x, y, 22, 12, BG, ' rx="2" stroke="%s"' % EDGE))
        b.append(glow(x + 11, y + 6, 16, 8, "White", 0.5))
    return svg("A war room at night: people round a table, facing a whiteboard with a network drawn from memory, the backup store crossed out in red",
               defs, "\n".join(b))


# ---------------------------------------------------------------- Act 3
def act3():
    defs = '''<linearGradient id="dawn" gradientUnits="userSpaceOnUse" x1="0" y1="56" x2="0" y2="228"><stop offset="0" stop-color="#58a6ff" stop-opacity="0.12"/><stop offset="0.8" stop-color="#58a6ff" stop-opacity="0.3"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0.3"/></linearGradient>
<linearGradient id="floor3" gradientUnits="userSpaceOnUse" x1="0" y1="228" x2="0" y2="360"><stop offset="0" stop-color="#21262d"/><stop offset="1" stop-color="#0d1117"/></linearGradient>'''
    b = [rect(0, 0, 800, 360, BG), rect(0, 228, 800, 132, "url(#floor3)")]
    # The open bay door: pre-dawn sky, and a lorry's open trailer backed up.
    b.append(rect(270, 56, 260, 172, "url(#dawn)"))
    b.append(rect(262, 48, 276, 8, EDGE))
    for i in range(4):
        b.append(rect(270, 50 + i * 2.5, 260, 1, LINE))  # the rolled-up door
    b.append(rect(300, 112, 200, 116, PANEL))
    b.append(rect(304, 116, 192, 112, "#0b0e13"))
    b.append(rect(298, 110, 4, 118, EDGE))
    b.append(rect(498, 110, 4, 118, EDGE))
    # Overhead lamp and its cone.
    b.append(rect(398, 0, 4, 30, EDGE))
    b.append('<path d="M386 34 L414 34 L420 40 L380 40 Z" fill="%s"/>' % LIGHT)
    b.append('<path d="M382 40 L418 40 L540 330 L260 330 Z" fill="url(#coneGold)" opacity="0.55"/>')
    b.append(glow(400, 300, 160, 30, "Gold", 0.7))

    # Roll cages with paper lists taped to them.
    def cage(x, y, w, h, sheets):
        out = [rect(x, y, w, h, "none", ' stroke="%s" stroke-width="2"' % EDGE)]
        for i in range(1, 6):
            out.append(rect(x + w * i / 6, y, 1, h, EDGE, ' opacity="0.7"'))
        for i in range(1, 8):
            out.append(rect(x, y + h * i / 8, w, 1, EDGE, ' opacity="0.7"'))
        for wx in (x + 8, x + w - 8):
            out.append('<circle cx="%g" cy="%g" r="5" fill="%s"/>' % (wx, y + h + 5, BG))
        for sx, sy, tick in sheets:
            out.append(rect(sx, sy, 30, 40, LIGHT, ' opacity="0.85"'))
            out.append(rect(sx + 9, sy - 3, 12, 6, MUTED, ' opacity="0.8"'))  # tape
            for i in range(5):
                out.append(rect(sx + 4, sy + 8 + i * 6, 22 - (i % 2) * 6, 1.5, PANEL))
            if tick:
                out.append('<path d="M%g %g l3 3 l6 -7" fill="none" stroke="%s" stroke-width="2"/>' % (sx + 20, sy + 31, RED))
        return "".join(out)
    b.append(cage(60, 140, 130, 150, [(78, 158, False), (130, 196, False)]))
    b.append(cage(600, 140, 130, 150, [(618, 170, True), (668, 160, False)]))
    # A clipboard hanging from the left cage, and a pen on a string.
    b.append(rect(146, 236, 34, 46, MUTED, ' rx="2"'))
    b.append(rect(149, 241, 28, 38, LIGHT, ' opacity="0.9"'))
    b.append(rect(155, 233, 16, 6, EDGE, ' rx="1"'))
    b.append('<path d="M180 240 q12 20 4 44" fill="none" stroke="%s"/>' % EDGE)
    # A hi-vis jacket on a hook by the door.
    b.append(rect(236, 92, 6, 4, EDGE))
    b.append('<path d="M239 96 L222 104 L218 160 L260 160 L256 104 Z" fill="%s" opacity="0.75"/>' % GOLD)
    for y in (126, 140):
        b.append(rect(220, y, 38, 4, LIGHT, ' opacity="0.8"'))
    # Someone with a clipboard, backlit in the doorway.
    b.append(figure(352, 228, 52))
    b.append(rect(358, 196, 10, 14, BG))
    return svg("A loading bay before dawn: a lorry backed up to the open door, paper lists taped to roll cages, a hi-vis jacket on a hook",
               defs, "\n".join(b))


# ---------------------------------------------------------------- Act 4
def act4():
    """The bookend to Act 0: the same depot, at dawn instead of dusk, and the
    first lorry of the day leaving through the gate."""
    defs = """<linearGradient id="dawn4" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="222"><stop offset="0" stop-color="#0d1117" stop-opacity="0"/><stop offset="0.5" stop-color="#58a6ff" stop-opacity="0.14"/><stop offset="0.85" stop-color="#58a6ff" stop-opacity="0.26"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0.38"/></linearGradient>
<linearGradient id="ground4" gradientUnits="userSpaceOnUse" x1="0" y1="222" x2="0" y2="360"><stop offset="0" stop-color="#21262d"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<linearGradient id="road4" gradientUnits="userSpaceOnUse" x1="0" y1="222" x2="0" y2="360"><stop offset="0" stop-color="#30363d"/><stop offset="1" stop-color="#161b22"/></linearGradient>
<clipPath id="sky4"><rect x="0" y="0" width="800" height="222"/></clipPath>"""
    b = [rect(0, 0, 800, 360, BG), rect(0, 0, 800, 222, "url(#dawn4)")]
    # The sun not up yet: only its light on the horizon, where the road goes.
    b.append('<g clip-path="url(#sky4)">' + glow(610, 226, 300, 80, "Gold", 0.9) + "</g>")
    for x, y, w in [(420, 70, 230), (90, 104, 180), (560, 118, 170)]:
        b.append(rect(x, y, w, 3, LIGHT, ' rx="1.5" opacity="0.07"'))
    # Low hills on the horizon.
    b.append('<path d="M0 222 Q120 196 240 214 T480 206 T720 210 L800 204 L800 222 Z" fill="%s"/>' % LINE)
    b.append(rect(0, 222, 800, 138, "url(#ground4)"))
    # The depot, left: dark now, except one small window, the night helpdesk.
    b.append(rect(30, 140, 310, 82, PANEL))
    b.append(rect(30, 140, 310, 3, EDGE))
    b.append('<path d="M30 140 L46 124 L324 124 L340 140 Z" fill="%s"/>' % LINE)
    for bx in (58, 118, 178, 238):
        b.append(rect(bx, 176, 40, 46, BG))
        for i in range(5):
            b.append(rect(bx, 179 + i * 9, 40, 1, LINE))
    b.append(glow(312, 168, 40, 22, "Gold", 0.9))
    b.append(rect(300, 158, 24, 18, GOLD, ' opacity="0.9"'))
    b.append(rect(311, 158, 2, 18, PANEL))
    # The road out, running from us to the dawn.
    b.append('<path d="M596 222 L624 222 L700 360 L330 360 Z" fill="url(#road4)"/>')
    for t0 in (0.08, 0.3, 0.6):
        t1 = t0 + 0.1 + t0 * 0.2
        y0, y1 = 222 + 138 * t0, 222 + 138 * t1
        x0, x1 = 610 - 95 * t0, 610 - 95 * t1
        w0, w1 = 1 + 3 * t0, 1 + 3 * t1
        b.append('<path d="M%g %g L%g %g L%g %g L%g %g Z" fill="%s" opacity="0.5"/>' % (x0 - w0, y0, x0 + w0, y0, x1 + w1, y1, x1 - w1, y1, MUTED))
    # The gate, open: two posts and their swung-back leaves.
    for px, leaf in ((548, -1), (660, 1)):
        b.append(rect(px - 3, 236, 6, 52, EDGE))
        x2 = px + leaf * 70
        b.append('<path d="M%g 242 L%g 250 L%g 280 L%g 284 Z" fill="none" stroke="%s" stroke-width="2"/>' % (px, x2, x2, px, EDGE))
        for i in range(1, 6):
            xi = px + leaf * 70 * i / 6
            b.append('<path d="M%g %g L%g %g" stroke="%s" stroke-width="1"/>' % (xi, 242 + 8 * i / 6, xi, 284 - 4 * i / 6, EDGE))
    # A yard lamp by the gate, still on.
    b.append('<path d="M%g 150 L%g 150 L%g 300 L%g 300 Z" fill="url(#coneGold)" opacity="0.45"/>' % (512, 520, 560, 472))
    b.append(rect(514.5, 148, 3, 140, EDGE))
    b.append(rect(509, 145, 14, 5, LIGHT, ' rx="2"'))
    # The first lorry of the day, from behind, heading for the horizon.
    lx, ly, lw, lh = 588, 226, 46, 40
    b.append(glow(lx + lw / 2, ly - 4, 50, 14, "Gold", 0.6))   # its headlights, on the road ahead
    b.append(rect(lx, ly, lw, lh, PANEL))
    b.append(rect(lx, ly, lw, 2, EDGE))
    b.append(rect(lx + lw / 2 - 0.5, ly + 2, 1, lh - 6, EDGE))   # the trailer's doors
    b.append(rect(lx - 2, ly + lh - 4, lw + 4, 4, BG))
    for tx in (lx + 4, lx + lw - 10):
        b.append(glow(tx + 3, ly + lh - 9, 14, 7, "Red", 0.9))
        b.append(rect(tx, ly + lh - 11, 6, 4, RED, ' rx="1"'))
    # You, by the gate, hands in pockets, with a long shadow towards us.
    b.append('<path d="M452 286 L440 360 L470 360 L458 286 Z" fill="%s" opacity="0.5"/>' % BG)
    b.append(figure(455, 286, 48))
    return svg("The depot at dawn: one window lit, the gate open, and the first lorry of the day heading out towards the sunrise, watched by a lone figure",
               defs, "\n".join(b))


# ---------------------------------------------------------------- Scenes
def nine_days():
    """'Nine Days': home late on a Sunday in December, and the decorations
    your partner put up without you, left on in the front window."""
    defs = """<linearGradient id="night9" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="250"><stop offset="0" stop-color="#0d1117" stop-opacity="0"/><stop offset="1" stop-color="#58a6ff" stop-opacity="0.14"/></linearGradient>
<linearGradient id="street9" gradientUnits="userSpaceOnUse" x1="0" y1="270" x2="0" y2="360"><stop offset="0" stop-color="#21262d"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<linearGradient id="spill9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2cc60" stop-opacity="0.35"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0"/></linearGradient>"""
    b = [rect(0, 0, 800, 360, BG), rect(0, 0, 800, 250, "url(#night9)")]
    random.seed(9)
    for _ in range(18):
        b.append('<circle cx="%g" cy="%g" r="%g" fill="%s" opacity="%g"/>' % (
            random.uniform(60, 740), random.uniform(20, 110), random.choice([0.8, 1, 1.3]), LIGHT, random.uniform(0.2, 0.5)))
    b.append(rect(0, 270, 800, 90, "url(#street9)"))
    b.append(rect(0, 270, 800, 2, EDGE))   # the kerb

    # A terrace of three houses; yours is the middle one.
    def house(x, w, roof_h, chimney):
        out = [rect(x, 110, w, 160, PANEL), rect(x, 110, w, 2, EDGE)]
        out.append(rect(chimney, 110 - roof_h - 22, 18, 24, LINE))
        return "".join(out)
    # One roof runs the length of the terrace.
    b.append('<path d="M34 110 L74 74 L726 74 L766 110 Z" fill="%s"/>' % LINE)
    b.append(house(40, 230, 36, 90))
    b.append(house(530, 230, 36, 690))
    b.append(house(270, 260, 36, 470))
    # The neighbours' windows: dark, except one blue with a television.
    for x, y, tv in [(70, 130, False), (180, 130, False), (70, 200, False), (180, 200, True),
                     (560, 130, False), (670, 130, True), (560, 200, False), (670, 200, False)]:
        b.append(rect(x, y, 60, 46, "#0b0e13", ' stroke="%s" stroke-width="2"' % EDGE))
        if tv:
            b.append(rect(x + 2, y + 2, 56, 42, BLUE, ' opacity="0.12"'))
    # Your house: dark upstairs, a dark front door with a faint fanlight.
    for x in (300, 430):
        b.append(rect(x, 128, 70, 50, "#0b0e13", ' stroke="%s" stroke-width="2"' % EDGE))
    b.append(rect(452, 196, 44, 74, "#0b0e13", ' stroke="%s" stroke-width="2"' % EDGE))
    b.append(rect(456, 200, 36, 8, GOLD, ' opacity="0.35"'))

    # The front window, lit gold, with the tree inside.
    wx, wy, ww, wh = 296, 188, 128, 74
    # The curtains narrow the light: a tighter glow round the window.
    b.append(glow(wx + ww / 2, wy + wh / 2, 115, 70, "Gold", 0.75))
    b.append(rect(wx, wy, ww, wh, GOLD, ' opacity="0.8"'))
    tx, base = wx + ww / 2, wy + wh
    tree = "M%g %g L%g %g L%g %g L%g %g L%g %g L%g %g L%g %g L%g %g L%g %g Z" % (
        tx, wy + 6, tx + 14, wy + 26, tx + 9, wy + 26, tx + 22, wy + 46, tx + 15, wy + 46,
        tx + 28, base - 6, tx - 28, base - 6, tx - 15, wy + 46, tx - 22, wy + 46)
    tree = tree.replace(" Z", " L%g %g L%g %g L%g %g Z" % (tx - 9, wy + 26, tx - 14, wy + 26, tx, wy + 6))
    b.append('<path d="%s" fill="%s"/>' % (tree, BG))
    b.append(rect(tx - 4, base - 6, 8, 6, BG))
    for i in range(14):                                                     # lights on the tree
        t = random.uniform(0.15, 0.95)
        y = wy + 6 + t * (wh - 12)
        half = 4 + t * 24
        b.append('<circle cx="%g" cy="%g" r="1.6" fill="%s"/>' % (tx + random.uniform(-half * 0.8, half * 0.8), y, LIGHT))
    b.append('<path d="M%g %g l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 l5 0 Z" fill="%s"/>' % (tx, wy - 1, LIGHT))
    b.append('<circle cx="%g" cy="%g" r="3" fill="%s"/>' % (tx + 10, wy + 40, RED))   # the one red bauble
    # Curtains, drawn back and tied, with the window's light on their edges.
    def curtain(side):
        x0 = wx if side < 0 else wx + ww          # the outer edge
        def X(dx):
            return x0 - side * dx
        tie = wy + 42
        d = "M%g %g L%g %g Q%g %g %g %g Q%g %g %g %g L%g %g Z" % (
            X(0), wy, X(30), wy, X(22), wy + 26, X(13), tie, X(20), tie + 16, X(26), wy + wh, X(0), wy + wh)
        out = ['<path d="%s" fill="%s"/>' % (d, LINE)]
        for f in (8, 16):                                   # folds
            out.append('<path d="M%g %g Q%g %g %g %g" fill="none" stroke="%s" stroke-width="1.2" opacity="0.8"/>' % (
                X(f), wy + 2, X(f * 0.7), wy + 26, X(f * 0.45), tie - 2, EDGE))
            out.append('<path d="M%g %g Q%g %g %g %g" fill="none" stroke="%s" stroke-width="1.2" opacity="0.8"/>' % (
                X(f * 0.45), tie + 3, X(f * 0.7), tie + 18, X(f * 0.9), wy + wh - 2, EDGE))
        out.append('<path d="M%g %g Q%g %g %g %g Q%g %g %g %g" fill="none" stroke="%s" stroke-width="1.2" opacity="0.55"/>' % (
            X(30), wy, X(22), wy + 26, X(13), tie, X(20), tie + 16, X(26), wy + wh, GOLD))
        out.append(rect(min(X(-1), X(15)), tie - 1.5, 16, 3, MUTED, ' rx="1.5"'))   # the tie-back
        return "".join(out)
    b.append(curtain(-1))
    b.append(curtain(1))
    b.append(rect(wx - 6, wy - 7, ww + 12, 4, EDGE, ' rx="1"'))           # the curtain rail
    b.append(rect(wx - 4, wy - 4, ww + 8, 4, EDGE))
    b.append(rect(wx - 4, wy + wh, ww + 8, 4, EDGE))
    # A string of lights along the front, under the gutter.
    for i in range(23):
        x = 282 + i * 11
        y = 120 + 5 * math.sin(i * math.pi / 2.75) ** 2
        b.append(glow(x, y, 7, 7, "Gold", 0.5))
        b.append('<circle cx="%g" cy="%g" r="1.8" fill="%s"/>' % (x, y, GOLD if i % 2 else LIGHT))

    # The front garden: a low wall, the gate, the path, and the window's light.
    b.append(rect(270, 262, 260, 8, LINE))
    # Only the gap between the curtains lights the path, and the curtains'
    # edges throw softer, darker margins either side of it.
    b.append('<path d="M%g 270 L%g 270 L%g 360 L%g 360 Z" fill="url(#spill9)" opacity="0.45"/>' % (wx + 14, wx + ww - 14, wx + ww + 14, wx - 14))
    b.append('<path d="M%g 270 L%g 270 L%g 360 L%g 360 Z" fill="url(#spill9)"/>' % (wx + 26, wx + ww - 26, wx + ww - 2, wx + 2))
    # Your car at the kerb, and you at the gate, looking at the window.
    b.append('<path d="M60 316 L70 296 Q78 284 100 284 L170 284 Q186 284 196 298 L226 302 Q236 304 236 316 Z" fill="%s"/>' % LINE)
    for cx in (92, 206):
        b.append('<circle cx="%g" cy="318" r="10" fill="%s"/>' % (cx, BG))
    b.append(rect(104, 290, 34, 10, EDGE, ' opacity="0.8"'))
    # Your shadow, thrown down the path towards us by the window behind you.
    b.append('<path d="M386 334 L398 334 L412 360 L372 360 Z" fill="%s" opacity="0.55"/>' % BG)
    b.append(figure(392, 334, 50))
    # A street lamp on the right.
    b.append('<path d="M%g 160 L%g 160 L%g 300 L%g 300 Z" fill="url(#coneWhite)" opacity="0.5"/>' % (744, 752, 790, 706))
    b.append(rect(746.5, 158, 3, 112, EDGE))
    b.append(rect(741, 155, 14, 5, LIGHT, ' rx="2"'))
    return svg("A terraced street at night: one front window lit gold, with a Christmas tree and lights, and a figure at the gate looking at it",
               defs, "\n".join(b))


def sam():
    """'Sam': the IT floor at night, every screen still dead, and one person
    on the helpdesk phone under a desk lamp."""
    defs = """<linearGradient id="wall5" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#161b22"/></linearGradient>
<linearGradient id="floor5" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="360"><stop offset="0" stop-color="#161b22"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<linearGradient id="lamp5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2cc60" stop-opacity="0.55"/><stop offset="1" stop-color="#f2cc60" stop-opacity="0.05"/></linearGradient>"""
    b = [rect(0, 0, 800, 200, "url(#wall5)"), rect(0, 200, 800, 160, "url(#floor5)")]
    # The wall of screens at the front: all dead.
    for r in range(2):
        for c in range(3):
            x, y = 262 + c * 94, 40 + r * 58
            b.append(rect(x, y, 88, 52, BG, ' stroke="%s" stroke-width="2"' % EDGE))
            b.append('<path d="M%g %g L%g %g" stroke="%s" stroke-width="6" opacity="0.5"/>' % (x + 10, y + 46, x + 40, y + 8, LINE))
    # Rows of empty desks with dead monitors, receding.
    for y, mw, mh, step, op in [(186, 22, 15, 26, 0.5), (220, 32, 22, 38, 0.7)]:
        b.append(rect(40, y, 720, 4 * op + 1, EDGE, ' opacity="%g"' % op))
        x = 60
        while x < 740:
            b.append(rect(x, y - mh - 4, mw, mh, BG, ' stroke="%s" stroke-width="1" opacity="%g"' % (EDGE, op + 0.1)))
            b.append(rect(x + mw / 2 - 1.5, y - 4, 3, 4, EDGE))
            x += mw + step
    # The one desk still in use, in the foreground.
    lx = 650
    b.append(glow(lx - 80, 270, 170, 50, "Gold", 0.6))
    b.append('<path d="M%g 216 L%g 216 L%g 278 L%g 278 Z" fill="url(#lamp5)" opacity="0.6"/>' % (lx - 30, lx - 14, lx - 20, lx - 150))
    # Sam, at the desk with the phone to their ear, lit from the side.
    sx = 430
    b.append('<g fill="%s"><circle cx="%g" cy="196" r="16"/><path d="M%g 286 L%g 238 Q%g 220 %g 218 L%g 218 Q%g 220 %g 238 L%g 286 Z"/></g>' % (
        BG, sx, sx - 40, sx - 36, sx - 32, sx - 14, sx + 14, sx + 32, sx + 36, sx + 40))
    b.append('<path d="M%g 186 A16 16 0 0 1 %g 206" fill="none" stroke="%s" stroke-width="2" opacity="0.6"/>' % (sx + 6, sx + 14, GOLD))
    b.append('<path d="M%g 226 Q%g 234 %g 262" fill="none" stroke="%s" stroke-width="2" opacity="0.45"/>' % (sx + 28, sx + 36, sx + 38, GOLD))
    b.append('<path d="M%g 250 L%g 214 L%g 196" stroke="%s" stroke-width="10" stroke-linecap="round" fill="none"/>' % (sx + 30, sx + 26, sx + 16, BG))   # the arm
    b.append(rect(sx + 10, 186, 8, 22, EDGE, ' rx="3"'))   # the handset
    # The desk.
    b.append('<path d="M250 276 L650 276 L680 300 L220 300 Z" fill="%s"/>' % LINE)
    b.append(rect(220, 300, 460, 40, PANEL))
    b.append(rect(250, 276, 400, 2, EDGE))
    b.append(glow(lx - 85, 286, 85, 12, "Gold", 0.9))   # the pool of lamplight on the desk
    # A dead monitor on the desk, turned away.
    b.append(rect(290, 222, 70, 46, BG, ' stroke="%s" stroke-width="2"' % EDGE))
    b.append(rect(322, 268, 6, 9, EDGE))
    # The desk phone, its cord, and the one red light: a call waiting.
    b.append('<path d="M470 282 L512 282 L516 294 L466 294 Z" fill="%s"/>' % EDGE)
    b.append('<path d="M%g 208 Q%g 270 474 284" fill="none" stroke="%s" stroke-width="1.5"/>' % (sx + 14, sx + 6, EDGE))
    b.append(glow(505, 286, 10, 6, "Red", 1))
    b.append('<circle cx="505" cy="286" r="2" fill="%s"/>' % RED)
    # A notepad, a pen and a mug in the lamplight.
    b.append('<path d="M530 284 L572 282 L576 296 L532 298 Z" fill="%s" opacity="0.9"/>' % LIGHT)
    for i in range(3):
        b.append(rect(536, 286 + i * 3.5, 30 - i * 6, 1.2, PANEL))
    b.append('<path d="M548 292 L568 287" stroke="%s" stroke-width="2"/>' % MUTED)
    b.append('<path d="M596 278 L612 278 L610 294 L598 294 Z" fill="%s"/>' % EDGE)
    # The desk lamp.
    b.append('<path d="M%g 296 L%g 296 L%g 292 L%g 292 Z" fill="%s"/>' % (lx - 12, lx + 12, lx + 8, lx - 8, EDGE))
    b.append('<path d="M%g 292 L%g 236 L%g 208" fill="none" stroke="%s" stroke-width="3"/>' % (lx, lx + 8, lx - 14, EDGE))
    b.append('<path d="M%g 200 L%g 206 L%g 218 L%g 210 Z" fill="%s"/>' % (lx - 8, lx - 36, lx - 28, lx - 2, EDGE))
    b.append(glow(lx - 22, 216, 12, 5, "Gold", 1))
    return svg("A dark IT floor at night: every screen dead, and one person at a desk under a lamp, on the phone, with a red light blinking on the desk phone",
               defs, "\n".join(b))


def last_system():
    """'The Last One': the same IT floor, every screen working again, and two
    uncorked bottles of champagne on the desk."""
    defs = """<linearGradient id="wall6" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#161b22"/></linearGradient>
<linearGradient id="floor6" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="360"><stop offset="0" stop-color="#161b22"/><stop offset="1" stop-color="#0d1117"/></linearGradient>
<linearGradient id="screen6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3a5c"/><stop offset="1" stop-color="#132538"/></linearGradient>"""
    b = [rect(0, 0, 800, 200, "url(#wall6)"), rect(0, 200, 800, 160, "url(#floor6)")]
    random.seed(21)
    # The wall of screens, alive: a map, charts and tables.
    b.append(glow(400, 100, 260, 110, "White", 0.5))
    for r in range(2):
        for c in range(3):
            x, y = 262 + c * 94, 40 + r * 58
            b.append(rect(x, y, 88, 52, "url(#screen6)", ' stroke="%s" stroke-width="2"' % EDGE))
            kind = (r * 3 + c) % 3
            if kind == 0:     # a map with routes
                for _ in range(4):
                    pts = " ".join("%g,%g" % (x + random.uniform(8, 80), y + random.uniform(8, 44)) for _ in range(3))
                    b.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="1.2" opacity="0.7"/>' % (pts, BLUE))
                for _ in range(6):
                    b.append('<circle cx="%g" cy="%g" r="1.6" fill="%s"/>' % (x + random.uniform(10, 78), y + random.uniform(10, 42), LIGHT))
            elif kind == 1:   # a bar chart
                for i in range(7):
                    h = random.uniform(8, 34)
                    b.append(rect(x + 10 + i * 10, y + 44 - h, 6, h, LIGHT, ' opacity="0.65"'))
            else:             # a table
                for i in range(6):
                    b.append(rect(x + 8, y + 8 + i * 6.5, random.uniform(40, 72), 2, LIGHT, ' opacity="0.6"'))
    # Rows of desks, every monitor on.
    for y, mw, mh, step, op in [(186, 22, 15, 26, 0.6), (220, 32, 22, 38, 0.8)]:
        b.append(rect(40, y, 720, 4 * op + 1, EDGE, ' opacity="%g"' % op))
        x = 60
        while x < 740:
            b.append(glow(x + mw / 2, y - mh / 2 - 4, mw, mh, "White", 0.3))
            b.append(rect(x, y - mh - 4, mw, mh, "url(#screen6)", ' stroke="%s" stroke-width="1" opacity="%g"' % (EDGE, op + 0.2)))
            for i in range(3):
                b.append(rect(x + 3, y - mh - 1 + i * (mh / 4), mw * (0.45 + 0.12 * i), 1.2 * op + 0.4, LIGHT, ' opacity="0.6"'))
            b.append(rect(x + mw / 2 - 1.5, y - 4, 3, 4, EDGE))
            x += mw + step
    # The foreground desk, with its own monitor on.
    b.append('<path d="M250 276 L650 276 L680 300 L220 300 Z" fill="%s"/>' % LINE)
    b.append(rect(220, 300, 460, 40, PANEL))
    b.append(rect(250, 276, 400, 2, EDGE))
    b.append(glow(325, 245, 70, 40, "White", 0.5))
    b.append(rect(290, 222, 70, 46, "url(#screen6)", ' stroke="%s" stroke-width="2"' % EDGE))
    for i in range(4):
        b.append(rect(297, 230 + i * 8, 40 + (i % 2) * 14, 2, LIGHT, ' opacity="0.65"'))
    b.append(rect(322, 268, 6, 9, EDGE))

    # Two bottles of champagne, uncorked, the corks beside them; mugs, not glasses.
    def bottle(x, base):
        out = ['<path d="M%g %g L%g %g Q%g %g %g %g L%g %g L%g %g L%g %g L%g %g Q%g %g %g %g L%g %g Z" fill="%s"/>' % (
            x - 9, base, x - 9, base - 30, x - 9, base - 40, x - 3, base - 46, x - 3, base - 58,
            x + 3, base - 58, x + 3, base - 46, x + 3, base - 46, x + 9, base - 40, x + 9, base - 30, x + 9, base, BG)]
        out.append(rect(x - 3.5, base - 60, 7, 6, MUTED))                  # the foil, torn open
        out.append(rect(x - 9, base - 24, 18, 10, LIGHT, ' opacity="0.5"'))  # the label
        out.append('<path d="M%g %g L%g %g" stroke="%s" stroke-width="1.5" opacity="0.45"/>' % (x - 6, base - 36, x - 6, base - 6, LIGHT))  # a highlight
        return "".join(out)
    b.append(bottle(470, 290))
    b.append(bottle(500, 292))
    for cx, cy in [(530, 291), (446, 293)]:
        b.append('<path d="M%g %g l6 -2 l2 5 l-6 2 Z" fill="%s"/>' % (cx, cy, MUTED))   # corks
    for mx in (560, 590, 410):
        b.append('<path d="M%g 278 L%g 278 L%g 294 L%g 294 Z" fill="%s"/>' % (mx, mx + 14, mx + 12, mx + 2, EDGE))
        b.append('<path d="M%g 282 q6 1 0 8" fill="none" stroke="%s" stroke-width="1.5"/>' % (mx + 14, EDGE))
    return svg("The IT floor with every screen working again: dashboards on the wall, monitors lit on every desk, and two uncorked champagne bottles beside some coffee mugs",
               defs, "\n".join(b))


os.makedirs(OUT, exist_ok=True)
for name, fn in [("act0", act0), ("act1", act1), ("act2", act2), ("act3", act3), ("act4", act4), ("nine_days", nine_days), ("sam", sam), ("last_system", last_system)]:
    open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8", newline="").write(fn())
print("ok")
