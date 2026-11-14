"""
云阶财神殿 · Blender mesh build.

Original geometry for this page. Architecture is a double-eave hip roof with
real barrel tiles, dougong and an imperial stair. The visitor and 财神 are
voxel-remeshed volumes (fused organic forms), not stacked primitive props.
Marble maps are Poly Haven marble_01, CC0. Everything else is generated here.

Run: blender -b -P tools/build_celestial.py
"""
import math
import os
import traceback

import bmesh
import bpy
from mathutils import Vector

OUT = "/workspace/caishen/assets"
TEX = os.path.join(OUT, "tex")
os.makedirs(TEX, exist_ok=True)
PREV = "/tmp/cs-preview"
os.makedirs(PREV, exist_ok=True)

TAU = math.tau


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


reset()
scene = bpy.context.scene


def link(ob):
    bpy.context.collection.objects.link(ob)
    return ob


def set_input(node, names, value):
    for name in names:
        if name in node.inputs:
            node.inputs[name].default_value = value
            return True
    return False


def new_material(name, rgb, metallic=0.0, roughness=0.45, emit=0.0, coat=0.0, sheen=0.0, subsurface=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.use_backface_culling = False
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    if emit:
        bsdf.inputs["Emission Color"].default_value = (rgb[0], rgb[1], rgb[2], 1)
        bsdf.inputs["Emission Strength"].default_value = emit
    if coat:
        set_input(bsdf, ("Coat Weight",), coat)
        set_input(bsdf, ("Coat Roughness",), 0.25)
    if sheen:
        set_input(bsdf, ("Sheen Weight",), sheen)
        set_input(bsdf, ("Sheen Roughness",), 0.4)
        bsdf.inputs["Sheen Tint"].default_value = (1, 0.9, 0.7, 1) if "Sheen Tint" in bsdf.inputs else 0
    if subsurface:
        set_input(bsdf, ("Subsurface Weight",), subsurface)
        if "Subsurface Radius" in bsdf.inputs:
            bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.25)
        set_input(bsdf, ("Subsurface Scale",), 0.012)
    if alpha < 1:
        mat.blend_method = "BLEND"
        mat.show_transparent_back = False
    return mat


def image_tex_material(name, image, rgb, metallic, roughness, normal_image=None, uv_scale=(1, 1), emit=0.0, coat=0.0):
    mat = new_material(name, rgb, metallic, roughness, emit=emit, coat=coat)
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = image
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (uv_scale[0], uv_scale[1], 1)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(coord.outputs["UV"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    if normal_image is not None:
        ntex = nt.nodes.new("ShaderNodeTexImage")
        ntex.image = normal_image
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        nmap.inputs["Strength"].default_value = 0.7
        nt.links.new(mapping.outputs["Vector"], ntex.inputs["Vector"])
        nt.links.new(ntex.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def paint_image(name, w, h, fn):
    img = bpy.data.images.new(name, w, h, alpha=True)
    pix = [0.0] * (w * h * 4)
    for y in range(h):
        for x in range(w):
            r, g, b, a = fn(x, y, w, h)
            i = (y * w + x) * 4
            pix[i] = r
            pix[i + 1] = g
            pix[i + 2] = b
            pix[i + 3] = a
    img.pixels.foreach_set(pix)
    img.pack()
    return img


def cloud_motif(px, py):
    """Soft ruyi cloud, returns 0..1 coverage."""
    spots = ((0, 0, 10), (-12, 2, 8), (12, 1, 8), (0, 8, 7), (-6, -6, 6), (7, -5, 6), (0, -2, 5))
    m = 0.0
    for cx, cy, rad in spots:
        d = math.hypot(px - cx, py - cy) / rad
        m = max(m, max(0.0, 1.0 - d * d))
    return m


def make_brocade():
    def fn(x, y, w, h):
        u = x / w
        v = y / h
        base = (0.55, 0.045, 0.055)
        weave = 0.94 + 0.06 * (0.5 + 0.5 * math.sin(x * 1.7) * math.sin(y * 1.7))
        r, g, b = [c * weave for c in base]
        # gold hem and collar bands in V
        if v < 0.055 or v > 0.93 or abs(u - 0.5) < 0.012:
            r, g, b = 0.92, 0.72, 0.28
        cell = 128
        lx = (x % cell) - cell * 0.5
        ly = (y % cell) - 18
        m = cloud_motif(lx, ly)
        if m > 0.2:
            t = min(1.0, (m - 0.2) / 0.8)
            r = r * (1 - t) + 0.95 * t
            g = g * (1 - t) + 0.74 * t
            b = b * (1 - t) + 0.28 * t
        return r, g, b, 1

    return paint_image("brocade", 512, 512, fn)


def make_weave_normal():
    w = h = 128
    img = bpy.data.images.new("weave_n", w, h, alpha=False)
    img.colorspace_settings.name = "Non-Color"
    pix = [0.0] * (w * h * 4)
    for y in range(h):
        for x in range(w):
            # fine diagonal cloth ribs
            h0 = 0.5 + 0.5 * math.sin((x + y * 0.4) * 0.85)
            hx = 0.5 + 0.5 * math.sin((x + 1 + y * 0.4) * 0.85)
            hy = 0.5 + 0.5 * math.sin((x + (y + 1) * 0.4) * 0.85)
            nx, ny, nz = (h0 - hx), (h0 - hy), 0.55
            length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1
            i = (y * w + x) * 4
            pix[i] = nx / length * 0.5 + 0.5
            pix[i + 1] = ny / length * 0.5 + 0.5
            pix[i + 2] = nz / length * 0.5 + 0.5
            pix[i + 3] = 1
    img.pixels.foreach_set(pix)
    img.pack()
    return img


def ob_from_bm(name, bm, mat=None):
    me = bpy.data.meshes.new(name + "_m")
    bm.to_mesh(me)
    bm.free()
    me.update()
    for poly in me.polygons:
        poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    link(ob)
    if mat is not None:
        ob.data.materials.append(mat)
    return ob


def empty(name, loc=(0, 0, 0)):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_type = "PLAIN_AXES"
    ob.empty_display_size = 0.08
    ob.location = loc
    return link(ob)


def adopt(child, parent):
    """Parent without moving the child in world space. Later parent motion still applies."""
    bpy.context.view_layer.update()
    world = child.matrix_world.copy()
    child.parent = parent
    child.matrix_world = world
    bpy.context.view_layer.update()
    return child


def attach(child, parent):
    """Child.location / rotation stay in the parent's local space."""
    from mathutils import Matrix
    loc = child.location.copy()
    rot = child.rotation_euler.copy()
    scale = child.scale.copy()
    child.parent = parent
    child.matrix_parent_inverse = Matrix.Identity(4)
    child.location = loc
    child.rotation_euler = rot
    child.scale = scale
    return child


def shade(ob):
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    try:
        bpy.ops.object.shade_smooth()
    except Exception:
        pass
    ob.select_set(False)


def ell(loc, scale, segs=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=max(8, segs // 2), radius=1.0, location=loc)
    ob = bpy.context.active_object
    ob.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    return ob


def voxel_join(parts, name, voxel, mat):
    bpy.ops.object.select_all(action="DESELECT")
    for ob in parts:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    if len(parts) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    mod = ob.modifiers.new("vox", "REMESH")
    mod.mode = "VOXEL"
    mod.voxel_size = voxel
    mod.use_smooth_shade = True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    mod = ob.modifiers.new("sm", "SMOOTH")
    mod.factor = 0.3
    mod.iterations = 3
    bpy.ops.object.modifier_apply(modifier=mod.name)
    ob.data.materials.clear()
    if mat:
        ob.data.materials.append(mat)
    shade(ob)
    print("remesh", name, "verts", len(ob.data.vertices))
    return ob


def grid(name, nu, nv, fn, mat, uv=True, double=False):
    bm = bmesh.new()
    verts = []
    for i in range(nu):
        row = []
        for j in range(nv):
            p = fn(i / (nu - 1), j / (nv - 1))
            row.append(bm.verts.new(p))
        verts.append(row)
    for i in range(nu - 1):
        for j in range(nv - 1):
            try:
                f = bm.faces.new((verts[i][j], verts[i][j + 1], verts[i + 1][j + 1], verts[i + 1][j]))
                f.smooth = True
            except ValueError:
                pass
    if uv:
        layer = bm.loops.layers.uv.new("UVMap")
        for f in bm.faces:
            for loop in f.loops:
                # recover approximate uv from the vert index order is unnecessary;
                # callers that need specific uvs can overwrite. Default: object xy.
                co = loop.vert.co
                loop[layer].uv = (co.x * 0.25, co.y * 0.25)
    bm.normal_update()
    if bm.faces:
        avg_z = sum(f.normal.z for f in bm.faces) / len(bm.faces)
        if avg_z < -0.5:
            bmesh.ops.reverse_faces(bm, faces=list(bm.faces))
            bm.normal_update()
    ob = ob_from_bm(name, bm, mat)
    if double and ob.data.materials:
        ob.data.materials[0].use_backface_culling = False
    return ob


def assign_uv(ob, fn):
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    uv = me.uv_layers.active.data
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv[li].uv = fn(co)


def lathe(name, profile, segments, mat, loc=(0, 0, 0)):
    bm = bmesh.new()
    rings = []
    for radius, z in profile:
        ring = []
        for i in range(segments):
            a = TAU * i / segments
            ring.append(bm.verts.new((radius * math.cos(a), radius * math.sin(a), z)))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for j in range(segments):
            j2 = (j + 1) % segments
            bm.faces.new((rings[i][j], rings[i][j2], rings[i + 1][j2], rings[i + 1][j]))
    bm.faces.new(rings[0])
    bm.faces.new(list(reversed(rings[-1])))
    bm.normal_update()
    # outward
    center = Vector((0, 0, sum(p[1] for p in profile) / len(profile)))
    flip = False
    for f in bm.faces:
        c = f.calc_center_median()
        if (c - center).dot(f.normal) < 0:
            flip = True
            break
    if flip:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    ob = ob_from_bm(name, bm, mat)
    ob.location = loc
    return ob


def tube(name, pts, radius, mat, sides=8):
    bm = bmesh.new()
    frames = []
    for i, p in enumerate(pts):
        p = Vector(p)
        if i < len(pts) - 1:
            forward = Vector(pts[i + 1]) - p
        else:
            forward = p - Vector(pts[i - 1])
        forward.normalize()
        up = Vector((0, 0, 1))
        if abs(forward.dot(up)) > 0.9:
            up = Vector((1, 0, 0))
        side = forward.cross(up).normalized()
        lift = side.cross(forward).normalized()
        ring = []
        for s in range(sides):
            a = TAU * s / sides
            ring.append(bm.verts.new(p + (side * math.cos(a) + lift * math.sin(a)) * radius))
        frames.append(ring)
    for i in range(len(frames) - 1):
        for j in range(sides):
            j2 = (j + 1) % sides
            bm.faces.new((frames[i][j], frames[i][j2], frames[i + 1][j2], frames[i + 1][j]))
    bm.normal_update()
    return ob_from_bm(name, bm, mat)


def S(x, h, south):
    """Three.js (x, height, south) -> Blender Z-up. Face/-Y is south, +Z is up."""
    return (x, -south, h)


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

weave_n = make_weave_normal()
brocade = make_brocade()

mat_lacquer = new_material("Lacquer", (0.45, 0.035, 0.04), 0.08, 0.32, coat=0.55)
mat_gold = new_material("Gold", (1.0, 0.72, 0.22), 1.0, 0.22, emit=0.12)
mat_jade = new_material("Glaze", (0.16, 0.48, 0.42), 0.25, 0.22, coat=0.35)
mat_jade_dark = new_material("GlazeDark", (0.05, 0.22, 0.2), 0.2, 0.35)
mat_timber = new_material("Timber", (0.28, 0.12, 0.07), 0.02, 0.62)
mat_skin = new_material("Skin", (0.86, 0.62, 0.48), 0.0, 0.42, sheen=0.25, subsurface=0.18)
mat_hair = new_material("Hair", (0.035, 0.028, 0.025), 0.15, 0.38)
mat_robe = new_material("Robe", (0.94, 0.91, 0.84), 0.0, 0.48, sheen=0.45)
mat_robe_f = new_material("Robe", (0.90, 0.66, 0.66), 0.0, 0.48, sheen=0.45)
mat_trim = new_material("Trim", (0.12, 0.42, 0.38), 0.2, 0.35, coat=0.2)
mat_trim_f = new_material("Trim", (0.55, 0.62, 0.48), 0.15, 0.4, sheen=0.3)
mat_shoe = new_material("Shoe", (0.07, 0.06, 0.055), 0.1, 0.5)
mat_jewel = new_material("Jewel", (0.75, 0.05, 0.06), 0.2, 0.18, emit=0.35)
mat_paper = new_material("Paper", (1.0, 0.72, 0.38), 0.0, 0.45, emit=1.4)
mat_peak = new_material("Peak", (0.55, 0.62, 0.68), 0.0, 0.85)
mat_water = new_material("Water", (0.85, 0.9, 0.95), 0.05, 0.15, emit=0.25)
mat_crane = new_material("Crane", (0.95, 0.95, 0.96), 0.0, 0.4, sheen=0.2)
mat_cushion = new_material("Cushion", (0.55, 0.04, 0.05), 0.0, 0.7)

marble_diff = bpy.data.images.load(os.path.join(TEX, "marble_diff.jpg"))
marble_nor = bpy.data.images.load(os.path.join(TEX, "marble_nor.jpg"))
marble_nor.colorspace_settings.name = "Non-Color"
mat_marble = image_tex_material("Marble", marble_diff, (1, 1, 1), 0.0, 0.55, marble_nor, uv_scale=(1, 1))

# cloth normal on robes
for mat in (mat_robe, mat_robe_f, mat_lacquer):
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    ntex = nt.nodes.new("ShaderNodeTexImage")
    ntex.image = weave_n
    nmap = nt.nodes.new("ShaderNodeNormalMap")
    nmap.inputs["Strength"].default_value = 0.45
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (7, 7, 1)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(coord.outputs["UV"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], ntex.inputs["Vector"])
    nt.links.new(ntex.outputs["Color"], nmap.inputs["Color"])
    nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])

# brocade albedo on a dedicated god robe material
mat_brocade = new_material("Brocade", (1, 1, 1), 0.05, 0.42, sheen=0.35, coat=0.15)
nt = mat_brocade.node_tree
bsdf = nt.nodes["Principled BSDF"]
tex = nt.nodes.new("ShaderNodeTexImage")
tex.image = brocade
coord = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(coord.outputs["UV"], tex.inputs["Vector"])
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])


def select_tree(ob, bag):
    bag.append(ob)
    for c in ob.children:
        select_tree(c, bag)


def export_root(root, path):
    bag = []
    select_tree(root, bag)
    bpy.ops.object.select_all(action="DESELECT")
    for ob in bag:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print("wrote", path, os.path.getsize(path))


# ---------------------------------------------------------------------------
# Roof
# ---------------------------------------------------------------------------

def roof_params(half_w, ridge_half, center, half_d, eave_y, ridge_y, curl):
    return dict(half_w=half_w, ridge_half=ridge_half, center=center, half_d=half_d,
                eave_y=eave_y, ridge_y=ridge_y, curl=curl)


LOWER = roof_params(7.15, 3.35, -1.65, 5.05, 5.22, 8.05, 1.15)
UPPER = roof_params(5.15, 2.35, -1.85, 3.45, 6.85, 9.05, 0.72)


def slope_t(p, x, south):
    ax = abs(x)
    ad = abs(south - p["center"])
    if ax <= p["ridge_half"]:
        return ad / p["half_d"]
    hx = (ax - p["ridge_half"]) / (p["half_w"] - p["ridge_half"])
    hd = ad / p["half_d"]
    return max(hx, hd)


def roof_h(p, x, south):
    t = slope_t(p, x, south)
    y = p["ridge_y"] - t * (p["ridge_y"] - p["eave_y"])
    if t > 0.72:
        k = (t - 0.72) / 0.28
        axn = min(1.0, abs(x) / p["half_w"])
        corn = max(0.0, (axn - 0.45) / 0.55)
        y += (k * k) * p["curl"] * (0.28 + 0.85 * corn)
    return y


def add_roof(parent, p, name):
    # undercloak so gaps read as shade, not holes
    nu, nv = 36, 28

    def cloak(u, v):
        x = (u * 2 - 1) * p["half_w"]
        south = p["center"] + (v * 2 - 1) * p["half_d"]
        # pull the corners in slightly so the cloak stays on the hip
        t = slope_t(p, x, south)
        if t > 1:
            # project back
            scale = 1 / t
            x *= scale
            south = p["center"] + (south - p["center"]) * scale
        return S(x, roof_h(p, x, south) - 0.05, south)

    sheet = grid(name + "Cloak", nu, nv, cloak, mat_timber)
    adopt(sheet, parent)

    bm = bmesh.new()
    col = bm.loops.layers.color.new("Col")
    uv = bm.loops.layers.uv.new("UVMap")
    step_x = 0.34
    step_s = 0.36
    nx = int(p["half_w"] * 2 / step_x)
    ns = int(p["half_d"] * 2 / step_s)
    count = 0
    for ix in range(nx):
        for iy in range(ns):
            x = -p["half_w"] + (ix + 0.5) * step_x
            south = p["center"] - p["half_d"] + (iy + 0.5) * step_s
            t = slope_t(p, x, south)
            if t > 0.98 or t < 0.04:
                continue
            h = roof_h(p, x, south)
            eps = 0.12
            dhdx = roof_h(p, x + eps, south) - roof_h(p, x - eps, south)
            dhds = roof_h(p, x, south + eps) - roof_h(p, x, south - eps)
            # downhill in three.js x / south
            down_x, down_s = -dhdx, -dhds
            glen = math.hypot(down_x, down_s) or 1.0
            down_x /= glen
            down_s /= glen
            across_x, across_s = -down_s, down_x
            lift = 0.55
            normal = Vector(S(across_x, 0, across_s)).cross(Vector(S(down_x, 0, down_s)))
            # S() maps height into Z; rebuild an orthonormal frame in blender
            origin = Vector(S(x, h + 0.02, south))
            ax_b = Vector(S(x + across_x, h, south + across_s)) - Vector(S(x, h, south))
            dn_b = Vector(S(x + down_x, h, south + down_s)) - Vector(S(x, h, south))
            if ax_b.length < 1e-6 or dn_b.length < 1e-6:
                continue
            ax_b.normalize()
            dn_b.normalize()
            up_b = ax_b.cross(dn_b).normalized()
            if up_b.z < 0:
                up_b.negate()
            arch = ((-0.145, 0.0), (-0.06, 0.055), (0.06, 0.055), (0.145, 0.0))
            rings = []
            for end, fade in ((-0.17, 0.65), (0.17, 1.0)):
                ring = []
                for a, lift_a in arch:
                    ring.append(bm.verts.new(origin + ax_b * a + dn_b * end + up_b * (lift_a * fade)))
                rings.append(ring)
            face = bm.faces.new((rings[0][0], rings[0][1], rings[0][2], rings[0][3],
                                  rings[1][3], rings[1][2], rings[1][1], rings[1][0]))
            face.smooth = True
            # split into two quads for better glTF (ngons are ok but quads are safer)
            bm.faces.remove(face)
            f1 = bm.faces.new((rings[0][0], rings[0][1], rings[1][1], rings[1][0]))
            f2 = bm.faces.new((rings[0][1], rings[0][2], rings[1][2], rings[1][1]))
            f3 = bm.faces.new((rings[0][2], rings[0][3], rings[1][3], rings[1][2]))
            shade_c = 0.82 + 0.18 * ((ix * 3 + iy * 5) % 7) / 6.0
            for f in (f1, f2, f3):
                f.smooth = True
                for loop in f.loops:
                    loop[col] = (shade_c, shade_c, shade_c, 1)
                    loop[uv].uv = (0.5, 0.5)
            count += 1
    print(name, "tiles", count)
    tiles = ob_from_bm(name + "Tiles", bm, mat_jade)
    # vertex color * glaze
    nt = mat_jade.node_tree
    if "VC" not in [n.name for n in nt.nodes]:
        vc = nt.nodes.new("ShaderNodeVertexColor")
        vc.name = "VC"
        vc.layer_name = "Col"
        mix = nt.nodes.new("ShaderNodeMixRGB")
        mix.blend_type = "MULTIPLY"
        mix.inputs["Fac"].default_value = 1
        bsdf = nt.nodes["Principled BSDF"]
        # base already set; multiply vertex color
        nt.links.new(vc.outputs["Color"], mix.inputs["Color1"])
        mix.inputs["Color2"].default_value = bsdf.inputs["Base Color"].default_value
        nt.links.new(mix.outputs["Color"], bsdf.inputs["Base Color"])
    adopt(tiles, parent)

    # ridge barrels
    bm = bmesh.new()
    ridge_south = p["center"]
    x = -p["ridge_half"]
    while x <= p["ridge_half"]:
        h = roof_h(p, x, ridge_south) + 0.06
        origin = Vector(S(x, h, ridge_south))
        along = Vector((1, 0, 0))
        up = Vector((0, 0, 1))
        side = Vector((0, 1, 0))
        ring_a = []
        ring_b = []
        for i in range(7):
            a = math.pi * i / 6
            off = up * math.sin(a) * 0.09 + side * math.cos(a) * 0.09
            ring_a.append(bm.verts.new(origin - along * 0.16 + off))
            ring_b.append(bm.verts.new(origin + along * 0.16 + off))
        for i in range(6):
            bm.faces.new((ring_a[i], ring_a[i + 1], ring_b[i + 1], ring_b[i]))
        x += 0.3
    ridge = ob_from_bm(name + "Ridge", bm, mat_gold)
    adopt(ridge, parent)

    # chiwen at ridge ends
    for sign in (-1, 1):
        pts = []
        x0 = sign * p["ridge_half"]
        for i in range(10):
            t = i / 9
            pts.append(S(
                x0 + sign * t * 0.15,
                roof_h(p, x0, p["center"]) + 0.12 + math.sin(t * math.pi) * 0.55 + t * 0.25,
                p["center"] - sign * t * 0.05,
            ))
        horn = tube(name + "Chiwen%d" % sign, pts, 0.075, mat_gold, 8)
        adopt(horn, parent)

    # hip beasts, small teardrops along the four hips
    for sx in (-1, 1):
        for sz in (-1, 1):
            for k in range(4):
                t = 0.35 + k * 0.14
                x = sx * (p["ridge_half"] + t * (p["half_w"] - p["ridge_half"]))
                south = p["center"] + sz * t * p["half_d"]
                if slope_t(p, x, south) > 1:
                    continue
                h = roof_h(p, x, south) + 0.12
                beast = lathe(
                    name + "Beast",
                    [(0.02, 0), (0.07, 0.06), (0.045, 0.16), (0.01, 0.24)],
                    8, mat_gold, S(x, h, south),
                )
                adopt(beast, parent)


def dougong_row(parent, p, name):
    bm = bmesh.new()

    def cube(cx, cy, cz, sx, sy, sz):
        res = bmesh.ops.create_cube(bm, size=1.0)
        for v in res["verts"]:
            v.co.x = v.co.x * sx + cx
            v.co.y = v.co.y * sy + cy
            v.co.z = v.co.z * sz + cz

    # one bracket, local: x across, y toward south (negative blender y is south,
    # so the bracket is built in three-space then we won't — build in blender:
    # local X across, local Y = -south (forward toward viewer is -Y), local Z up.
    def cube_b(cx, sy, cz, sx, ssy, sz):
        # sy is south offset
        cube(cx, -sy, cz, sx, ssy, sz)

    # stamp
    x = -p["half_w"] + 0.45
    while x < p["half_w"] - 0.3:
        south = p["center"] + p["half_d"] * 0.92
        # pull ends back onto the hip eave
        ax = abs(x)
        if ax > p["ridge_half"]:
            ht = (ax - p["ridge_half"]) / (p["half_w"] - p["ridge_half"])
            south = p["center"] + p["half_d"] * (1 - 0.55 * ht)
        h = roof_h(p, x, south) - 0.42
        base = Vector(S(x, h, south))
        # rebuild cubes relative to base by creating in a side bmesh? easier: direct verts
        x += 0.78
        # use a fresh local cube function writing world blender coords
        def block(dx, ds, dh, sx, ss, sh, mat_later=None):
            c = base + Vector((dx, -ds, dh))
            res = bmesh.ops.create_cube(bm, size=1.0)
            for v in res["verts"]:
                v.co = c + Vector((v.co.x * sx, v.co.y * ss, v.co.z * sh))

        block(0, 0, 0.05, 0.16, 0.16, 0.1)
        block(0, 0, 0.16, 0.46, 0.1, 0.07)
        block(0, -0.12, 0.26, 0.1, 0.28, 0.07)
        block(0, 0, 0.34, 0.14, 0.14, 0.08)
    brackets = ob_from_bm(name, bm, mat_lacquer)
    adopt(brackets, parent)

    # main beam
    beam = lathe  # silence linters
    del beam
    bm = bmesh.new()
    res = bmesh.ops.create_cube(bm, size=1.0)
    # beam along X under the front eave, blender
    south = p["center"] + p["half_d"] * 0.78
    h = p["eave_y"] - 0.55
    center = Vector(S(0, h, south))
    for v in res["verts"]:
        v.co = center + Vector((v.co.x * p["half_w"] * 0.92, v.co.y * 0.16, v.co.z * 0.14))
    beam_ob = ob_from_bm(name + "Beam", bm, mat_lacquer)
    adopt(beam_ob, parent)


def column(parent, x, south, base_h, height, name):
    profile = []
    steps = 14
    for i in range(steps):
        t = i / (steps - 1)
        r = 0.2 * (1.0 - 0.12 * ((t - 0.15) ** 2))
        if t < 0.06:
            r = 0.34 - t * 1.6
        if t > 0.94:
            r = 0.2 + (t - 0.94) * 1.4
        profile.append((r, t * height))
    ob = lathe(name, profile, 18, mat_lacquer, S(x, base_h, south))
    adopt(ob, parent)
    band = lathe(name + "Band", [(0.23, 0), (0.25, 0.04), (0.23, 0.08)], 16, mat_gold, S(x, base_h + height * 0.72, south))
    adopt(band, parent)
    cap = lathe(name + "Cap", [(0.26, 0), (0.32, 0.06), (0.36, 0.1), (0.3, 0.16)], 16, mat_gold, S(x, base_h + height - 0.02, south))
    adopt(cap, parent)
    foot = lathe(name + "Foot", [(0.42, 0), (0.4, 0.08), (0.3, 0.16), (0.26, 0.22)], 16, mat_marble, S(x, base_h - 0.02, south))
    adopt(foot, parent)


def baluster(parent, x, h, south, name):
    post = lathe(name, [(0.075, 0), (0.05, 0.28), (0.065, 0.5), (0.09, 0.62), (0.04, 0.78)], 8, mat_marble, S(x, h, south))
    adopt(post, parent)


def build_hall():
    root = empty("Hall")
    # terrace
    plaza = grid("WalkPlaza", 2, 2, lambda u, v: S((u * 2 - 1) * 10.5, 0.02, 4.35 + v * 10.2), mat_marble)
    assign_uv(plaza, lambda co: (co.x * 0.22, -co.y * 0.22))
    adopt(plaza, root)
    # thickness skirt so the terrace has an edge over the clouds
    skirt = grid("DecorSkirt", 2, 2, lambda u, v: S((u * 2 - 1) * 10.5, -0.55, 4.35 + v * 10.2), mat_marble)
    adopt(skirt, root)
    edge = grid("DecorEdge", 2, 2, lambda u, v: S(-10.5 + u * 21.0, -0.55 + v * 0.57, 14.55), mat_marble)
    adopt(edge, root)

    platform = grid("WalkPlatform", 2, 2, lambda u, v: S((u * 2 - 1) * 7.4, 1.62, -6.35 + v * 8.7), mat_marble)
    assign_uv(platform, lambda co: (co.x * 0.22, -co.y * 0.22))
    adopt(platform, root)

    # imperial stair: side flights + carved center ramp
    steps = 16
    for i in range(steps):
        t = i / steps
        south = 4.45 - t * 2.35
        h = 0.04 + t * 1.58
        for side, x0 in ((-1, -4.15), (1, 0.85)):
            slab = grid(
                "WalkStep%d%s" % (i, "W" if side < 0 else "E"),
                2, 2,
                lambda u, v, south=south, h=h, x0=x0: S(x0 + u * 3.3, h, south - 0.02 + v * 0.28),
                mat_marble,
            )
            assign_uv(slab, lambda co: (co.x * 0.3, -co.y * 0.3))
            adopt(slab, root)
    ramp = grid("WalkRamp", 8, 18, lambda u, v: S(
        -0.75 + u * 1.5,
        0.05 + v * 1.56 + 0.02 * math.sin(u * math.pi) * math.sin(v * math.pi * 3),
        4.45 - v * 2.35,
    ), mat_marble)
    assign_uv(ramp, lambda co: (co.x * 0.45, -co.y * 0.45))
    adopt(ramp, root)

    # balustrade along outer stair and platform lip
    for i in range(9):
        t = i / 8
        baluster(root, -4.35, 0.15 + t * 1.45, 4.4 - t * 2.2, "BlockRailW%d" % i)
        baluster(root, 4.35, 0.15 + t * 1.45, 4.4 - t * 2.2, "BlockRailE%d" % i)
    for i in range(11):
        x = -6.6 + i * 1.32
        if abs(x) < 1.3:
            continue
        baluster(root, x, 1.62, 2.15, "BlockRailF%d" % i)

    # rail bars
    for x, name in ((-4.35, "BlockRailBarW"), (4.35, "BlockRailBarE")):
        bar = tube(name, [S(x, 0.7, 4.3), S(x, 1.35, 3.2), S(x, 2.05, 2.2)], 0.045, mat_marble, 6)
        adopt(bar, root)

    p = LOWER
    col_h = p["eave_y"] - 1.62 - 0.5
    for x in (-5.15, -2.55, 2.55, 5.15):
        column(root, x, 1.45, 1.62, col_h, "BlockCol")
        column(root, x * 0.92, -4.7, 1.62, col_h + 0.35, "BlockColB")
    for south in (-1.4, -3.2):
        column(root, -6.3, south, 1.62, col_h, "BlockColS")
        column(root, 6.3, south, 1.62, col_h, "BlockColS")

    add_roof(root, LOWER, "RoofL")
    add_roof(root, UPPER, "RoofU")
    dougong_row(root, LOWER, "DougongL")
    dougong_row(root, UPPER, "DougongU")

    # back screen
    wall = grid("BlockWall", 2, 2, lambda u, v: S(-5.6 + u * 11.2, 1.7 + v * 3.3, -5.55), mat_lacquer)
    adopt(wall, root)
    panel = grid("DecorPanel", 2, 2, lambda u, v: S(-3.4 + u * 6.8, 2.15 + v * 2.3, -5.42), mat_gold)
    adopt(panel, root)
    inner = grid("DecorPanelIn", 2, 2, lambda u, v: S(-3.15 + u * 6.3, 2.3 + v * 2.0, -5.36), new_material("Panel", (0.42, 0.04, 0.05), 0.05, 0.4))
    adopt(inner, root)

    # side pavilions, smaller, beside the court
    for sign in (-1, 1):
        ox = sign * 12.4
        plat = grid("WalkSide%d" % sign, 2, 2, lambda u, v, ox=ox: S(ox - 2.2 + u * 4.4, 0.35, -1.2 + v * 3.6), mat_marble)
        adopt(plat, root)
        for dx in (-1.3, 1.3):
            column(root, ox + dx, 1.6, 0.35, 2.5, "BlockColP")
        mini = roof_params(2.5, 1.1, 0.2, 2.0, 3.15, 4.35, 0.45)
        # shift mini roof by moving the sampling origin: wrap height with ox
        # add_roof is centered at x=0, so build a translated copy by parenting a shifted empty
        holder = empty("Pavilion%d" % sign, (0, 0, 0))
        attach(holder, root)
        add_roof(holder, mini, "RoofP%d" % sign)
        holder.location = (ox, 0, 0)

    # ding censer
    burner = lathe(
        "BlockBurner",
        [(0.08, 0.15), (0.22, 0.28), (0.34, 0.55), (0.3, 0.85), (0.42, 0.98), (0.36, 1.05)],
        24, mat_gold, S(0, 0, 8.5),
    )
    adopt(burner, root)
    for k in range(3):
        a = TAU * k / 3
        leg = tube(
            "BlockBurnerLeg",
            [S(math.cos(a) * 0.12, 0.28, 8.5 + math.sin(a) * 0.12),
             S(math.cos(a) * 0.28, 0.05, 8.5 + math.sin(a) * 0.28),
             S(math.cos(a) * 0.32, 0.0, 8.5 + math.sin(a) * 0.32)],
            0.035, mat_gold, 6,
        )
        adopt(leg, root)
    handle = tube(
        "DecorBurnerHandle",
        [S(-0.32, 0.85, 8.5), S(-0.48, 1.15, 8.5), S(-0.32, 1.35, 8.5)],
        0.028, mat_gold, 6,
    )
    adopt(handle, root)
    handle = tube(
        "DecorBurnerHandleR",
        [S(0.32, 0.85, 8.5), S(0.48, 1.15, 8.5), S(0.32, 1.35, 8.5)],
        0.028, mat_gold, 6,
    )
    adopt(handle, root)

    # lanterns
    def lantern(name, x, h, south):
        body = lathe(name, [(0.05, 0), (0.16, 0.08), (0.18, 0.28), (0.14, 0.42), (0.05, 0.5)], 6, mat_paper, S(x, h, south))
        adopt(body, root)
        cap = lathe(name + "Cap", [(0.04, 0), (0.12, 0.06), (0.02, 0.14)], 8, mat_gold, S(x, h + 0.48, south))
        adopt(cap, root)
        tassel = tube(name + "Tassel", [S(x, h, south), S(x, h - 0.28, south)], 0.012, mat_lacquer, 5)
        adopt(tassel, root)

    for x in (-4.2, -1.5, 1.5, 4.2):
        lantern("DecorLantern", x, 4.15, 2.35)
    lantern("DecorLanternS", -6.4, 3.3, 0.2)
    lantern("DecorLanternS2", 6.4, 3.3, 0.2)

    # distant ridgelines
    def peak_height(x, south):
        h = 0.0
        for cx, cs, rad, amp in (
            (-18, -46, 16, 22), (8, -58, 18, 28), (34, -48, 14, 18),
            (-42, -52, 14, 16), (18, -36, 10, 12), (-8, -72, 20, 18),
        ):
            d = math.hypot((x - cx) / rad, (south - cs) / rad)
            h += amp * math.exp(-d * d * 1.4)
        return h

    nu, nv = 70, 48
    bm = bmesh.new()
    layer = bm.loops.layers.color.new("Col")
    verts = []
    for i in range(nu):
        row = []
        for j in range(nv):
            x = -70 + i / (nu - 1) * 140
            south = -28 - j / (nv - 1) * 62
            row.append(bm.verts.new(S(x, peak_height(x, south) - 4.0, south)))
        verts.append(row)
    for i in range(nu - 1):
        for j in range(nv - 1):
            f = bm.faces.new((verts[i][j], verts[i][j + 1], verts[i + 1][j + 1], verts[i + 1][j]))
            for loop in f.loops:
                hh = loop.vert.co.z
                snow = max(0.0, min(1.0, (hh - 10) / 12))
                mist = max(0.0, min(1.0, (-loop.vert.co.y - 40) / 50))
                r = 0.42 * (1 - mist) + 0.72 * mist + snow * 0.25
                g = 0.5 * (1 - mist) + 0.76 * mist + snow * 0.25
                b = 0.58 * (1 - mist) + 0.82 * mist + snow * 0.22
                loop[layer] = (r, g, b, 1)
    peaks = ob_from_bm("DecorPeaks", bm, mat_peak)
    nt = mat_peak.node_tree
    vc = nt.nodes.new("ShaderNodeVertexColor")
    vc.layer_name = "Col"
    bsdf = nt.nodes["Principled BSDF"]
    nt.links.new(vc.outputs["Color"], bsdf.inputs["Base Color"])
    adopt(peaks, root)

    # stone arch bridge, left distance
    def bridge_point(u):
        # u 0..1 across the span
        x = -30 + u * 16
        arch = math.sin(u * math.pi)
        h = 1.2 + arch * 5.2
        south = -34 - (u - 0.5) * 2
        return x, h, south

    deck = grid("DecorBridge", 3, 28, lambda u, v: S(
        *bridge_point(v)[:1],
        bridge_point(v)[1] + 0.05,
        bridge_point(v)[2] + (u - 0.5) * 1.3,
    ) if False else (
        # inline properly
        bridge_point(v)[0],
        -(bridge_point(v)[2] + (u - 0.5) * 1.3),
        bridge_point(v)[1],
    ), mat_marble)
    adopt(deck, root)
    rail_pts_l = []
    rail_pts_r = []
    arch_pts = []
    for i in range(18):
        u = i / 17
        x, h, south = bridge_point(u)
        rail_pts_l.append(S(x, h + 0.55, south - 0.55))
        rail_pts_r.append(S(x, h + 0.55, south + 0.55))
        arch_pts.append(S(x, h - 0.15 - math.sin(u * math.pi) * 0.9, south))
    adopt(tube("DecorBridgeRail", rail_pts_l, 0.06, mat_marble, 6), root)
    adopt(tube("DecorBridgeRailR", rail_pts_r, 0.06, mat_marble, 6), root)
    adopt(tube("DecorBridgeArch", arch_pts, 0.1, mat_marble, 6), root)

    # waterfall on the central distant peak
    fall = grid("DecorFall", 2, 8, lambda u, v: S(-1.5 + u * 1.6, 16 - v * 14, -56), mat_water)
    adopt(fall, root)

    # cranes
    def crane(name, x, h, south, yaw):
        body = ell(S(x, h, south), (0.18, 0.08, 0.07), 16)
        body.data.materials.append(mat_crane)
        neck_pts = []
        for i in range(8):
            t = i / 7
            neck_pts.append(S(x + math.sin(yaw) * t * 0.45, h + 0.05 + math.sin(t * math.pi) * 0.28, south + math.cos(yaw) * t * 0.45))
        neck = tube(name + "Neck", neck_pts, 0.025, mat_crane, 6)
        wing_l = grid(name + "WingL", 2, 6, lambda u, v, x=x, h=h, south=south: S(
            x - 0.05 - u * 0.55, h + 0.04 - (v - 0.2) ** 2 * 0.15, south + (v - 0.5) * 0.45
        ), mat_crane)
        wing_r = grid(name + "WingR", 2, 6, lambda u, v, x=x, h=h, south=south: S(
            x + 0.05 + u * 0.55, h + 0.02 - v * 0.05, south + (v - 0.5) * 0.5
        ), mat_crane)
        adopt(body, root)
        adopt(neck, root)
        adopt(wing_l, root)
        adopt(wing_r, root)

    crane("DecorCrane", -6.5, 7.6, 5.5, 0.6)
    crane("DecorCraneB", 7.2, 8.4, -2.0, -0.4)

    try:
        add_plaque(root)
    except Exception:
        traceback.print_exc()
    return root


def add_plaque(root):
    font = bpy.data.fonts.load("/usr/share/fonts/truetype/wqy/wqy-microhei.ttc")
    bpy.ops.object.text_add(location=S(0, 4.35, 1.7))
    ob = bpy.context.active_object
    ob.data.body = "财神殿"
    ob.data.font = font
    ob.data.align_x = "CENTER"
    ob.data.align_y = "CENTER"
    ob.data.extrude = 0.025
    ob.data.size = 0.42
    ob.data.bevel_depth = 0.004
    # face south: text faces +Z by default. Rotate so normal is -Y (south).
    ob.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.convert(target="MESH")
    ob.name = "DecorPlaque"
    ob.data.materials.append(mat_gold)
    back = grid("DecorPlaqueBack", 2, 2, lambda u, v: S(-1.15 + u * 2.3, 4.05 + v * 0.7, 1.78), mat_lacquer)
    adopt(back, root)
    adopt(ob, root)

    bpy.ops.object.text_add(location=S(0, 3.55, 1.62))
    ob2 = bpy.context.active_object
    ob2.data.body = "招财进宝"
    ob2.data.font = font
    ob2.data.align_x = "CENTER"
    ob2.data.extrude = 0.015
    ob2.data.size = 0.18
    ob2.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.convert(target="MESH")
    ob2.name = "DecorMotto"
    ob2.data.materials.append(mat_gold)
    adopt(ob2, root)


# ---------------------------------------------------------------------------
# People
# ---------------------------------------------------------------------------

def sculpt_head(ob, deity=False, female=False):
    me = ob.data
    for v in me.vertices:
        x, y, z = v.co.x, v.co.y, v.co.z
        front = -y
        for sx in (-1, 1):
            dx = x - sx * (0.034 if not deity else 0.05)
            dz = z - (0.018 if not deity else 0.02)
            d = math.sqrt(dx * dx * 1.3 + dz * dz * 1.5)
            rad = 0.026 if not deity else 0.038
            if d < rad and front > 0.02:
                k = (1 - d / rad) ** 2
                v.co.y += k * (0.016 if not deity else 0.028)
        # nose bridge stays proud
        if abs(x) < (0.018 if not deity else 0.028) and -0.02 < z < (0.05 if not deity else 0.07) and front > 0.02:
            v.co.y -= (0.012 if not deity else 0.02) * (1 - abs(x) / 0.03)
        mouth_z = -0.042 if not deity else -0.055
        if abs(z - mouth_z) < (0.018 if not deity else 0.028) and front > 0.02:
            corner = max(0.0, abs(x) - (0.008 if not deity else 0.012))
            v.co.z += corner * (0.7 if not deity else 1.6)
            if abs(x) < (0.022 if not deity else 0.035):
                v.co.y -= 0.006 if not deity else 0.01
        if deity and abs(x) > 0.04 and abs(x) < 0.1 and abs(z) < 0.04 and front > 0:
            v.co.x *= 1.04
    me.update()


def make_head(name, deity=False, female=False):
    if deity:
        parts = [
            ell((0, 0.0, 0.03), (0.16, 0.155, 0.17), 28),
            ell((0, 0.01, -0.08), (0.12, 0.12, 0.09), 20),
            ell((0, -0.04, -0.15), (0.055, 0.05, 0.045), 14),
            ell((0, -0.11, 0.0), (0.028, 0.05, 0.07), 14),
            ell((0, -0.15, -0.03), (0.034, 0.03, 0.028), 12),
            ell((0, -0.09, 0.06), (0.13, 0.035, 0.028), 14),
            ell((-0.07, -0.04, -0.02), (0.055, 0.04, 0.05), 12),
            ell((0.07, -0.04, -0.02), (0.055, 0.04, 0.05), 12),
            ell((0, -0.1, -0.07), (0.05, 0.025, 0.018), 10),
            ell((0, -0.09, -0.095), (0.045, 0.02, 0.016), 10),
            ell((-0.145, 0.0, -0.02), (0.03, 0.018, 0.07), 10),
            ell((0.145, 0.0, -0.02), (0.03, 0.018, 0.07), 10),
            ell((-0.15, -0.01, -0.1), (0.02, 0.016, 0.04), 8),
            ell((0.15, -0.01, -0.1), (0.02, 0.016, 0.04), 8),
        ]
        ob = voxel_join(parts, name, 0.011, mat_skin)
    else:
        sx = 0.92 if female else 1.0
        parts = [
            ell((0, 0, 0.02), (0.072 * sx, 0.086, 0.09), 28),
            ell((0, 0.005, -0.055), (0.05 * sx, 0.062, 0.048), 18),
            ell((0, -0.02, -0.09), (0.026, 0.028, 0.026), 12),
            ell((0, -0.075, 0.0), (0.012, 0.026, 0.042), 12),
            ell((0, -0.095, -0.018), (0.015, 0.016, 0.014), 10),
            ell((0, -0.06, 0.035), (0.062, 0.016, 0.012), 12),
            ell((-0.035, -0.03, -0.01), (0.028, 0.02, 0.03), 10),
            ell((0.035, -0.03, -0.01), (0.028, 0.02, 0.03), 10),
            ell((0, -0.07, -0.04), (0.022, 0.012, 0.01), 8),
            ell((0, -0.065, -0.055), (0.02, 0.01, 0.01), 8),
            ell((-0.075, 0.0, -0.01), (0.016, 0.01, 0.032), 8),
            ell((0.075, 0.0, -0.01), (0.016, 0.01, 0.032), 8),
        ]
        ob = voxel_join(parts, name, 0.0055, mat_skin)
    sculpt_head(ob, deity=deity, female=female)
    return ob


def eyes_and_brows(parent, deity=False, female=False):
    spread = 0.05 if deity else 0.03
    depth = -0.155 if deity else -0.092
    height = 0.02 if deity else 0.02
    scale = 1.85 if deity else 1.15
    iris_mat = new_material("Iris", (0.12, 0.07, 0.05), 0.05, 0.28)
    white = new_material("Sclera", (0.95, 0.93, 0.9), 0.0, 0.25)
    for s in (-1, 1):
        bpy.ops.mesh.primitive_circle_add(vertices=20, radius=0.013 * scale, fill_type="NGON",
                                          location=(s * spread, depth + 0.004, height))
        eye_white = bpy.context.active_object
        eye_white.rotation_euler = (math.radians(90), 0, 0)
        eye_white.scale = (1.15, 1, 0.72)
        eye_white.data.materials.append(white)
        attach(eye_white, parent)
        bpy.ops.mesh.primitive_circle_add(vertices=20, radius=0.0075 * scale, fill_type="NGON",
                                          location=(s * spread, depth, height))
        iris = bpy.context.active_object
        iris.rotation_euler = (math.radians(90), 0, 0)
        iris.data.materials.append(iris_mat)
        attach(iris, parent)
        bpy.ops.mesh.primitive_circle_add(vertices=12, radius=0.005 * scale, fill_type="NGON",
                                          location=(s * spread, depth - 0.001, height))
        pupil = bpy.context.active_object
        pupil.rotation_euler = (math.radians(90), 0, 0)
        pupil.data.materials.append(mat_hair)
        attach(pupil, parent)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0022 * scale, location=(s * spread - s * 0.003, depth - 0.002, height + 0.004))
        catch = bpy.context.active_object
        catch.data.materials.append(new_material("Catch", (1, 1, 1), 0, 0.1, emit=0.4))
        attach(catch, parent)
        # lid as a thin curved grid
        lid = grid(
            "Lid", 2, 8,
            lambda u, v, s=s: (
                s * spread + (v - 0.5) * 0.026 * scale,
                depth - 0.004 - u * 0.004,
                height + 0.006 * scale + math.sin(v * math.pi) * 0.008 * scale - u * 0.01 * scale,
            ),
            mat_skin,
        )
        attach(lid, parent)
        brow = grid(
            "Brow", 2, 8,
            lambda u, v, s=s: (
                s * spread + (v - 0.5) * 0.036 * scale,
                depth - 0.01,
                height + (0.02 + 0.01 * math.sin(v * math.pi)) * scale + u * 0.007 * scale,
            ),
            mat_hair,
        )
        attach(brow, parent)
    # lips
    lip = grid(
        "Lips", 3, 12,
        lambda u, v: (
            (v - 0.5) * (0.05 if deity else 0.028),
            (depth if deity else depth) - 0.008 - (0.5 - abs(u - 0.4)) * 0.004,
            ( -0.055 if deity else -0.042) + math.sin(v * math.pi) * (0.012 if deity else 0.004) - u * 0.006,
        ),
        new_material("Lip", (0.62, 0.28, 0.28), 0.05, 0.35, sheen=0.2),
    )
    attach(lip, parent)


def hair_shell(parent, female=False):
    parts = [
        ell((0, 0.015, 0.04), (0.084, 0.09, 0.085), 20),
        ell((0, 0.02, 0.1), (0.05, 0.05, 0.045), 14),
    ]
    if female:
        parts.append(ell((0, 0.03, 0.13), (0.06, 0.055, 0.05), 14))
        parts.append(ell((0.04, 0.02, -0.02), (0.02, 0.02, 0.08), 10))
    cap = voxel_join(parts, "HairCap", 0.006, mat_hair)
    # open the face: push front verts that are low back into the scalp by deleting them
    bm = bmesh.new()
    bm.from_mesh(cap.data)
    kill = []
    for v in bm.verts:
        if -v.co.y > 0.04 and v.co.z < 0.03:
            kill.append(v)
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    bm.to_mesh(cap.data)
    bm.free()
    cap.data.update()
    attach(cap, parent)
    pin = lathe("Hairpin", [(0.008, 0), (0.008, 0.16)], 6, mat_trim, (0, 0.02, 0.12))
    pin.rotation_euler = (0, math.radians(80), math.radians(20))
    attach(pin, parent)
    ribbon = grid(
        "Ribbon", 2, 16,
        lambda u, v: (
            (u - 0.5) * 0.025,
            0.06 + v * 0.05,
            0.1 - v * 0.55,
        ),
        mat_trim,
    )
    attach(ribbon, parent)


def robe_surface(name, mat, female, upper):
    """Standing robe. upper=True is the chest piece; else the skirt."""
    nu, nv = (18, 40) if not upper else (14, 36)

    def fn(u, v):
        ang = v * TAU
        # v=0 at the back (+Y). Front is ang=pi, y negative.
        if upper:
            height = 1.02 + u * 0.48
            spread = 0.16 + u * 0.05
            if female:
                spread *= 0.92
        else:
            height = 0.02 + u * 1.08
            flare = (1 - u) ** 1.05
            spread = 0.18 + flare * (0.34 if not female else 0.38)
        fold = 1 + 0.055 * math.sin(ang * 7 + u * 2) + 0.03 * math.sin(ang * 13 - u * 4)
        x = math.cos(ang) * spread * fold
        y = math.sin(ang) * spread * fold * 0.72
        # cross collar opening at the chest
        if upper and u > 0.55 and abs(math.atan2(y, x) + math.pi / 2) < 0.7:
            y -= 0.03
        return (x, y, height)

    ob = grid(name, nu, nv, fn, mat)
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    uv = me.uv_layers.active.data
    # rebuild uvs from height and angle roughly via position
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv[li].uv = ((math.atan2(co.y, co.x) / TAU) + 0.5, (co.z - 0.02) / 1.5)
    # outward-ish normals: flip if a front face points inward
    me.update()
    return ob


def sleeve_surface(name, mat, side, female=False):
    nu, nv = 16, 10

    def fn(u, v):
        # u shoulder->cuff, v across the cloth
        drop = u ** 0.85 * (0.78 if not female else 0.84)
        half = 0.06 + u * (0.2 if not female else 0.22)
        x = side * (0.18 + u * 0.16)
        z = 1.46 - drop
        y = (v - 0.5) * 2 * half
        z += -((v - 0.5) ** 2) * 0.12
        fold = 1 + 0.08 * math.sin(v * math.pi * 3 + u * 2)
        y *= fold
        # cuff turns slightly forward
        y -= u * 0.08
        return (x, y, z)

    return grid(name, nu, nv, fn, mat)


def boot(name, side):
    def fn(u, v):
        # u along foot, v around
        ang = v * TAU
        along = u
        r = 0.045 * (1 - 0.35 * along)
        x = side * 0.09 + math.cos(ang) * r
        y = -0.02 - along * 0.16
        z = 0.02 + math.sin(ang) * r * 0.6 + 0.02
        if along > 0.75:
            z += 0.015
        return (x, y, z)

    return grid(name, 8, 12, fn, mat_shoe)


def build_person(female=False):
    root = empty("Hanfu")
    robe_mat = mat_robe_f if female else mat_robe
    trim = mat_trim_f if female else mat_trim
    chest = empty("chest", (0, 0, 1.02))
    attach(chest, root)
    skirt_p = empty("skirt", (0, 0, 0))
    attach(skirt_p, root)
    skirt = robe_surface("skirtMesh", robe_mat, female, upper=False)
    adopt(skirt, skirt_p)
    upper = robe_surface("chestMesh", robe_mat, female, upper=True)
    adopt(upper, chest)
    # jade / sage cross collar
    for side, shift in ((-1, 0.0), (1, 0.0)):
        band = grid(
            "Collar", 2, 10,
            lambda u, v, side=side: (
                side * (0.02 + v * 0.1),
                -0.14 - v * 0.02,
                1.18 + v * 0.28 + side * v * 0.04,
            ),
            trim,
        )
        adopt(band, chest)
    sash = lathe("Sash", [(0.2, 0), (0.22, 0.035), (0.2, 0.07)], 24, trim, (0, 0, 0.98))
    adopt(sash, chest)
    # knot
    knot = ell((0, -0.2, 1.02), (0.035, 0.03, 0.03), 10)
    knot.data.materials.append(trim)
    adopt(knot, chest)

    head_p = empty("head", (0, 0, 0.6))
    attach(head_p, chest)
    head = make_head("Head", deity=False, female=female)
    attach(head, head_p)
    eyes_and_brows(head_p, deity=False, female=female)
    hair_shell(head_p, female=female)
    neck = lathe("Neck", [(0.04, 0), (0.045, 0.04), (0.05, 0.09)], 12, mat_skin, (0, 0, -0.08))
    attach(neck, head_p)

    for side, nm in ((-1, "sleevePivotL"), (1, "sleevePivotR")):
        piv = empty(nm, (side * 0.16, 0, 0.42))
        attach(piv, chest)
        sl = sleeve_surface("sleeve" + nm, robe_mat, side, female)
        adopt(sl, piv)
        cuff = lathe("Cuff", [(0.1, 0), (0.11, 0.02)], 12, trim, (side * 0.34, -0.08, 0.68))
        adopt(cuff, piv)

    for side, nm in ((-1, "thighL"), (1, "thighR")):
        piv = empty(nm, (side * 0.09, 0, 0.9))
        attach(piv, root)
        leg = boot("boot" + nm, side)
        adopt(leg, piv)
    return root


# ---------------------------------------------------------------------------
# 财神
# ---------------------------------------------------------------------------

def yuanbao_mesh(name, scale=1.0):
    nu, nv = 16, 22

    def fn(u, v):
        length = (u - 0.5) * 2
        ang = v * TAU
        rise = (length ** 2) * 0.48
        pinch = 0.26 + 0.34 * (length ** 2)
        x = length * 0.62 * scale
        y = math.sin(ang) * pinch * 0.42 * scale
        z = (rise + math.cos(ang) * 0.1 * pinch) * scale
        return (x, y, z)

    return grid(name, nu, nv, fn, mat_gold)


def build_god():
    root = empty("Caishen")
    # throne
    seat = grid("ThroneSeat", 2, 2, lambda u, v: ((u - 0.5) * 1.7, 0.15 - v * 0.9, 0.72), mat_cushion)
    adopt(seat, root)
    back = grid(
        "ThroneBack", 18, 10,
        lambda u, v: (
            (v - 0.5) * 1.7 * (1 - 0.15 * u),
            0.55 + u * 0.15,
            0.7 + u * 1.7,
        ),
        mat_lacquer,
    )
    adopt(back, root)
    frame = grid(
        "ThroneFrame", 18, 8,
        lambda u, v: (
            (v - 0.5) * 1.9 * (1 - 0.12 * u),
            0.62,
            0.65 + u * 1.85,
        ),
        mat_gold,
    )
    adopt(frame, root)
    # armrests ending in dragon heads
    for side in (-1, 1):
        pts = [((side * 0.75), 0.35 - i / 8 * 0.7, 1.15 - i / 8 * 0.25) for i in range(9)]
        arm = tube("Arm%d" % side, pts, 0.07, mat_gold, 8)
        adopt(arm, root)
        head_parts = [
            ell((side * 0.78, -0.42, 0.88), (0.1, 0.14, 0.08), 14),
            ell((side * 0.78, -0.58, 0.84), (0.06, 0.1, 0.05), 12),
            ell((side * 0.78, -0.38, 0.98), (0.03, 0.03, 0.08), 8),
        ]
        dh = voxel_join(head_parts, "Dragon%d" % side, 0.018, mat_gold)
        adopt(dh, root)

    # seated brocade robe
    def robe_fn(u, v):
        ang = v * TAU
        hem = 0.95 * (1 - u) ** 0.9 + 0.42
        fold = 1 + 0.07 * math.sin(ang * 8 + u * 3) + 0.035 * math.sin(ang * 15)
        x = math.cos(ang) * hem * fold
        y = math.sin(ang) * hem * fold * 0.78
        z = 0.35 + u * 1.15
        front = max(0.0, -math.sin(ang))
        if u < 0.48:
            lap = math.sin(u / 0.48 * math.pi)
            y -= 0.55 * lap * front
            z += 0.22 * lap * front
        return (x, y, z)

    robe = grid("GodRobe", 28, 48, robe_fn, mat_brocade)
    me = robe.data
    uv = me.uv_layers.active.data
    for poly in me.polygons:
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            uv[li].uv = ((math.atan2(co.y, co.x) / TAU) + 0.5, max(0, min(1, (co.z - 0.3) / 1.3)))
    adopt(robe, root)

    # jade belt
    belt = lathe("Belt", [(0.48, 0), (0.5, 0.06), (0.48, 0.12)], 28, mat_trim, (0, -0.15, 1.05))
    adopt(belt, root)
    for i in range(5):
        plaque = grid("Plaque", 2, 2, lambda u, v, i=i: (-0.28 + i * 0.14 + u * 0.08, -0.5, 1.02 + v * 0.1), mat_gold)
        adopt(plaque, root)

    head_p = empty("GodHead", (0, -0.08, 1.72))
    attach(head_p, root)
    head = make_head("GodFace", deity=True)
    attach(head, head_p)
    eyes_and_brows(head_p, deity=True)

    # beard volume
    beard_parts = [
        ell((0, -0.14, -0.16), (0.1, 0.045, 0.06), 12),
        ell((0, -0.16, -0.32), (0.08, 0.05, 0.12), 12),
        ell((0, -0.17, -0.5), (0.06, 0.04, 0.12), 12),
        ell((-0.035, -0.15, -0.62), (0.03, 0.025, 0.1), 10),
        ell((0.035, -0.15, -0.62), (0.03, 0.025, 0.1), 10),
        ell((0, -0.16, -0.08), (0.055, 0.02, 0.018), 8),
    ]
    beard = voxel_join(beard_parts, "Beard", 0.012, mat_hair)
    attach(beard, head_p)
    # a few beard strands
    for k, x in enumerate((-0.06, -0.02, 0.02, 0.06)):
        strand = grid(
            "Strand", 2, 12,
            lambda u, v, x=x: (
                x + (u - 0.5) * 0.02,
                -0.16 - v * 0.02,
                -0.1 - v * 0.7,
            ),
            mat_hair,
        )
        attach(strand, head_p)

    # crown, authored in head-local space
    crown = lathe("Crown", [(0.17, 0.0), (0.2, 0.05), (0.19, 0.12), (0.16, 0.16)], 20, mat_gold, (0, -0.02, 0.14))
    attach(crown, head_p)
    jewel = ell((0, -0.16, 0.2), (0.05, 0.03, 0.055), 12)
    jewel.data.materials.append(mat_jewel)
    attach(jewel, head_p)
    for side in (-1, 1):
        wing = grid(
            "CrownWing", 2, 8,
            lambda u, v, side=side: (
                side * (0.16 + v * 0.28),
                0.0 - u * 0.02,
                0.18 + math.sin(v * math.pi) * 0.12,
            ),
            mat_gold,
        )
        attach(wing, head_p)
    halo = lathe("Halo", [(0.28, 0), (0.34, 0.025), (0.28, 0.05)], 32, mat_gold, (0, 0.2, 0.02))
    halo.rotation_euler = (math.radians(90), 0, 0)
    attach(halo, head_p)
    glow = new_material("HaloGlow", (1.0, 0.78, 0.35), 0.6, 0.28, emit=0.55)
    disc = lathe("HaloDisc", [(0.08, 0), (0.26, 0.015)], 28, glow, (0, 0.18, 0.02))
    disc.rotation_euler = (math.radians(90), 0, 0)
    attach(disc, head_p)

    # hands and ingots
    for side, nm in ((-1, "SpawnL"), (1, "SpawnR")):
        palm = [
            ell((side * 0.42, -0.78, 1.12), (0.1, 0.06, 0.045), 14),
            ell((side * 0.32, -0.84, 1.16), (0.035, 0.028, 0.05), 10),
            ell((side * 0.48, -0.86, 1.2), (0.03, 0.025, 0.055), 8),
        ]
        hand = voxel_join(palm, "Hand" + nm, 0.014, mat_skin)
        adopt(hand, root)
        ing = yuanbao_mesh("Held" + nm, 0.72)
        ing.location = (side * 0.46, -0.95, 1.08)
        ing.rotation_euler = (math.radians(-18), 0, side * 0.15)
        adopt(ing, root)
        sp = empty(nm, (side * 0.46, -0.95, 1.2))
        adopt(sp, root)

    # treasure basin
    basin = lathe("Basin", [(0.15, 0.05), (0.45, 0.12), (0.55, 0.28), (0.42, 0.34)], 24, mat_gold, (0, -1.15, 0.35))
    adopt(basin, root)
    for i in range(8):
        a = TAU * i / 8
        ing = yuanbao_mesh("Pile%d" % i, 0.22)
        ing.location = (math.cos(a) * 0.18, -1.15 + math.sin(a) * 0.12, 0.5)
        ing.rotation_euler = (0.4, a, 0.2)
        adopt(ing, root)
    return root


def look(cam, target):
    direction = Vector(target) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Z").to_euler()


def render_to(path, loc, target):
    cam = bpy.data.objects.get("PreviewCam")
    if cam is None:
        bpy.ops.object.camera_add()
        cam = bpy.context.active_object
        cam.name = "PreviewCam"
        scene.camera = cam
    cam.location = loc
    look(cam, target)
    cam.data.lens = 38
    cam.data.clip_start = 0.05
    cam.data.clip_end = 400
    scene.render.filepath = path
    scene.render.resolution_x = 1100
    scene.render.resolution_y = 640
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 24
    bpy.ops.render.render(write_still=True)
    print("rendered", path)


def main():
    print("building hall")
    hall = build_hall()
    print("building people")
    male = build_person(False)
    # park the figures on the terrace for the preview, facing south (+three Z = -Y)
    male.location = S(1.15, 0, 9.2)
    female = build_person(True)
    female.location = S(-1.15, 0, 9.6)
    print("building god")
    god = build_god()
    god.location = S(0, 1.62, -3.55)

    # preview lights
    bpy.ops.object.light_add(type="SUN", location=(0, 0, 20))
    sun = bpy.context.active_object
    sun.data.energy = 3.2
    sun.data.color = (1, 0.93, 0.82)
    sun.rotation_euler = (math.radians(48), math.radians(8), math.radians(-35))
    bpy.ops.object.light_add(type="AREA", location=S(2.2, 3.2, -1.2))
    area = bpy.context.active_object
    area.data.energy = 250
    area.data.size = 4
    area.data.color = (1, 0.85, 0.65)
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.95, 0.78, 0.62, 1)
    bg.inputs[1].default_value = 0.9

    export_root(hall, os.path.join(OUT, "hall.glb"))
    export_root(male, os.path.join(OUT, "hanfu_m.glb"))
    export_root(female, os.path.join(OUT, "hanfu_f.glb"))
    export_root(god, os.path.join(OUT, "caishen_god.glb"))
    # loose yuanbao for the flight mesh
    loose = yuanbao_mesh("Yuanbao", 1.0)
    root = empty("YuanRoot")
    adopt(loose, root)
    export_root(root, os.path.join(OUT, "yuanbao.glb"))

    try:
        render_to(os.path.join(PREV, "hall.png"), S(0.4, 2.1, 13.6), S(0, 4.4, 0.5))
        render_to(os.path.join(PREV, "god.png"), S(0.9, 3.1, -0.6), S(0, 3.0, -3.4))
        render_to(os.path.join(PREV, "avatar.png"), S(2.4, 1.15, 11.2), S(1.15, 1.15, 9.2))
    except Exception:
        traceback.print_exc()
    print("done")


if __name__ == "__main__":
    main()
