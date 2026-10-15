#!/usr/bin/env python3
"""Build the bilingual one-page CVs and the legacy English alias.

Install the optional authoring dependency with: python -m pip install reportlab
Run from any directory: python scripts/build_cvs.py
Content: content/cv.json. Output: assets/Tefik_Aliu_CV_{EN,SV}.pdf.
No dependency or build step is needed for the deployed website.
"""

from io import BytesIO
import json
from pathlib import Path
from xml.sax.saxutils import escape

import reportlab
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
INK = colors.HexColor("#243430")
ACCENT = colors.HexColor("#275e54")
MUTED = colors.HexColor("#52635e")
RULE = colors.HexColor("#ccd2c9")

# Embed the fonts bundled with ReportLab, so rendering is portable and does not
# depend on a PDF viewer's substitutes for the standard Helvetica/Times fonts.
FONT_DIR = Path(reportlab.__file__).resolve().parent / "fonts"
for name, filename in (("CVSans", "Vera.ttf"), ("CVSans-Bold", "VeraBd.ttf"),
                       ("CVSans-Italic", "VeraIt.ttf"), ("CVSans-BoldItalic", "VeraBI.ttf")):
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily("CVSans", normal="CVSans", bold="CVSans-Bold",
                              italic="CVSans-Italic", boldItalic="CVSans-BoldItalic")


def escaped(value):
    return escape(value, {'"': "&quot;"})


def link(url, label):
    return f'<link href="{escaped(url)}" color="#275e54">{escaped(label)}</link>'


def build_cv(data, language):
    local = data[language]
    pages = []
    buffer = BytesIO()

    class StableCanvas(Canvas):
        def __init__(self, *args, **kwargs):
            kwargs["invariant"] = True
            super().__init__(*args, **kwargs)

        def showPage(self):
            pages.append(self.getPageNumber())
            super().showPage()

    styles = {
        "name": ParagraphStyle("name", fontName="CVSans-Bold", fontSize=27, leading=32,
                               textColor=INK, spaceAfter=4),
        "title": ParagraphStyle("title", fontName="CVSans-Bold", fontSize=11.1,
                                leading=14, textColor=ACCENT, spaceAfter=7),
        "contact": ParagraphStyle("contact", fontName="CVSans", fontSize=8.7,
                                  leading=12, textColor=MUTED),
        "body": ParagraphStyle("body", fontName="CVSans", fontSize=9.1, leading=12.3,
                               textColor=INK, alignment=TA_LEFT),
        "section": ParagraphStyle("section", fontName="CVSans-Bold", fontSize=10.2,
                                  leading=13.3, textColor=ACCENT, spaceBefore=10.5,
                                  spaceAfter=5.5, keepWithNext=True),
        "project": ParagraphStyle("project", fontName="CVSans-Bold", fontSize=9.3,
                                  leading=12.5, textColor=INK, spaceBefore=4,
                                  spaceAfter=3, keepWithNext=True),
        "links": ParagraphStyle("links", fontName="CVSans", fontSize=8.3,
                                leading=11, textColor=MUTED, spaceBefore=3, spaceAfter=3),
    }
    flow = []

    def paragraph(text, style="body"):
        flow.append(Paragraph(text, styles[style]))

    paragraph(escaped(data["name"]), "name")
    paragraph(escaped(local["title"]), "title")
    paragraph(f'{escaped(local["location"])} | {link("mailto:" + data["email"], data["email"])}', "contact")
    portfolio = data["portfolio"] if language == "en" else data["portfolio"] + "index.sv.html"
    paragraph(f'{link(portfolio, "tefik-aliu.github.io")} | {link(data["github"], "github.com/tefik-aliu")}', "contact")
    flow.extend([Spacer(1, 8), HRFlowable(width="100%", thickness=0.5, color=RULE), Spacer(1, 8)])
    paragraph(escaped(local["profile"]))

    paragraph(escaped(local["skills_heading"]), "section")
    for label, body in local["skills"]:
        paragraph(f"<b>{escaped(label)}:</b> {escaped(body)}")

    paragraph(escaped(local["projects_heading"]), "section")
    for project in local["projects"]:
        paragraph(f'{escaped(project["name"])} | {escaped(project["focus"])}', "project")
        paragraph(escaped(project["body"]))
        links = []
        if project.get("overview"):
            links.append(link(project["overview"], local["overview_label"]))
        links.append(link(project["source"], local["code_label"]))
        paragraph(" | ".join(links), "links")

    paragraph(escaped(local["employment_heading"]), "section")
    paragraph(f'<b>{escaped(local["employment_title"])}</b>')
    paragraph(escaped(local["employment_body"]))

    paragraph(escaped(local["education_heading"]), "section")
    paragraph(escaped(local["education_body"]))
    paragraph(f'<b>{escaped(local["languages_label"])}:</b> {escaped(local["languages"])}')

    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=45, rightMargin=45, topMargin=35, bottomMargin=35,
        title=f'{data["name"]} - {local["title"]}', author=data["name"],
        subject="Independent software development projects, technical skills and professional background",
        pageCompression=1,
    )
    doc.build(flow, canvasmaker=StableCanvas)
    if pages != [1]:
        raise ValueError(f"{language}: expected one CV page, got {len(pages)}; shorten content or adjust layout")
    return buffer.getvalue()


def main():
    data = json.loads((ROOT / "content" / "cv.json").read_text(encoding="utf-8"))
    outputs = {language: build_cv(data, language) for language in ("en", "sv")}
    for language, content in outputs.items():
        path = ROOT / "assets" / f"Tefik_Aliu_CV_{language.upper()}.pdf"
        path.write_bytes(content)
        print(path.relative_to(ROOT))
    alias = ROOT / "assets" / "Tefik_Aliu_CV.pdf"
    alias.write_bytes(outputs["en"])
    print(f"{alias.relative_to(ROOT)} (English alias)")


if __name__ == "__main__":
    main()
