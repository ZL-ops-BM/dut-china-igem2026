import unittest
from pathlib import Path

from app import app


PAGES = [
    "alternative-platform",
    "contribution",
    "description",
    "education",
    "engineering",
    "entrepreneurship",
    "experiments",
    "hardware",
    "human-practices",
    "inclusivity",
    "measurement",
    "model",
    "notebook",
    "results",
    "safety-and-security",
    "software",
    "sustainability",
    "team",
]


class SiteRoutesTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home_contains_narrative_sections_and_motion_hooks(self):
        response = self.client.get("/")
        body = response.get_data(as_text=True)

        self.assertEqual(response.status_code, 200)
        for expected in (
            "Build a living answer.",
            "From question",
            "impact.",
            "Explore the wiki.",
            "A team",
            "motion.",
            "Explore our approach",
            'data-motion="hero-particles"',
            'data-reveal="section"',
        ):
            self.assertIn(expected, body)

    def test_shared_layout_exposes_accessible_navigation_and_scripts(self):
        response = self.client.get("/")
        body = response.get_data(as_text=True)

        self.assertIn('class="skip-link"', body)
        self.assertIn('aria-controls="site-navigation"', body)
        self.assertIn('aria-expanded="false"', body)
        self.assertIn("site.js", body)
        self.assertIn("home.js", body)

    def test_all_page_routes_render(self):
        for page in PAGES:
            with self.subTest(page=page):
                response = self.client.get(f"/{page}.html")
                self.assertEqual(response.status_code, 200)
                self.assertIn("DUT-China", response.get_data(as_text=True))


class StaticAssetsTest(unittest.TestCase):
    def test_required_scripts_exist(self):
        static = Path(__file__).parents[1] / "static"
        for relative in ("site.js", "home.js"):
            with self.subTest(relative=relative):
                self.assertTrue((static / relative).is_file())


if __name__ == "__main__":
    unittest.main()
