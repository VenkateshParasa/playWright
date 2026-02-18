#\!/usr/bin/env python3
"""Generate index.json and curriculum.json files"""
import json
import os
import glob

def load_all_lessons(base_path):
    """Load all lesson files"""
    lessons = []
    
    for track in ['playwright', 'selenium']:
        for category in ['beginner', 'intermediate', 'advanced']:
            pattern = os.path.join(base_path, track, category, 'lesson-*.json')
            files = sorted(glob.glob(pattern))
            
            for filepath in files:
                with open(filepath, 'r') as f:
                    lesson = json.load(f)
                    lessons.append(lesson)
    
    return lessons

def generate_index(lessons):
    """Generate index.json with all lessons metadata"""
    index = {
        "version": "1.0.0",
        "lastUpdated": "2026-02-17",
        "totalLessons": len(lessons),
        "tracks": {
            "playwright": {
                "name": "Playwright",
                "description": "Modern end-to-end testing framework by Microsoft",
                "totalLessons": 30,
                "categories": {
                    "beginner": {"count": 10, "estimatedHours": 4},
                    "intermediate": {"count": 10, "estimatedHours": 5},
                    "advanced": {"count": 10, "estimatedHours": 6}
                }
            },
            "selenium": {
                "name": "Selenium WebDriver",
                "description": "Industry-standard browser automation tool",
                "totalLessons": 30,
                "categories": {
                    "beginner": {"count": 10, "estimatedHours": 4},
                    "intermediate": {"count": 10, "estimatedHours": 5},
                    "advanced": {"count": 10, "estimatedHours": 6}
                }
            }
        },
        "lessons": []
    }
    
    # Add lesson summaries
    for lesson in lessons:
        index["lessons"].append({
            "id": lesson["id"],
            "title": lesson["title"],
            "slug": lesson["slug"],
            "track": lesson["track"],
            "category": lesson["category"],
            "order": lesson["order"],
            "duration": lesson["duration"],
            "description": lesson["description"],
            "estimatedXP": lesson["estimatedXP"],
            "prerequisites": lesson["prerequisites"],
            "nextLesson": lesson["nextLesson"],
            "tags": lesson["tags"]
        })
    
    return index

def generate_curriculum(lessons):
    """Generate curriculum.json with learning paths"""
    curriculum = {
        "version": "1.0.0",
        "learningPaths": {
            "playwright-complete": {
                "id": "playwright-complete",
                "name": "Playwright Complete Learning Path",
                "description": "Master Playwright from beginner to advanced level",
                "track": "playwright",
                "estimatedDuration": "15 hours",
                "totalLessons": 30,
                "difficulty": "beginner-to-advanced",
                "stages": [
                    {
                        "name": "Beginner",
                        "description": "Learn Playwright fundamentals",
                        "lessons": [l["id"] for l in lessons if l["track"] == "playwright" and l["category"] == "beginner"],
                        "estimatedDuration": "4 hours"
                    },
                    {
                        "name": "Intermediate",
                        "description": "Advanced features and patterns",
                        "lessons": [l["id"] for l in lessons if l["track"] == "playwright" and l["category"] == "intermediate"],
                        "estimatedDuration": "5 hours"
                    },
                    {
                        "name": "Advanced",
                        "description": "Expert techniques and best practices",
                        "lessons": [l["id"] for l in lessons if l["track"] == "playwright" and l["category"] == "advanced"],
                        "estimatedDuration": "6 hours"
                    }
                ]
            },
            "selenium-complete": {
                "id": "selenium-complete",
                "name": "Selenium Complete Learning Path",
                "description": "Master Selenium WebDriver from beginner to advanced level",
                "track": "selenium",
                "estimatedDuration": "15 hours",
                "totalLessons": 30,
                "difficulty": "beginner-to-advanced",
                "stages": [
                    {
                        "name": "Beginner",
                        "description": "Learn Selenium fundamentals",
                        "lessons": [l["id"] for l in lessons if l["track"] == "selenium" and l["category"] == "beginner"],
                        "estimatedDuration": "4 hours"
                    },
                    {
                        "name": "Intermediate",
                        "description": "Advanced features and patterns",
                        "lessons": [l["id"] for l in lessons if l["track"] == "selenium" and l["category"] == "intermediate"],
                        "estimatedDuration": "5 hours"
                    },
                    {
                        "name": "Advanced",
                        "description": "Expert techniques and best practices",
                        "lessons": [l["id"] for l in lessons if l["track"] == "selenium" and l["category"] == "advanced"],
                        "estimatedDuration": "6 hours"
                    }
                ]
            },
            "quick-start-playwright": {
                "id": "quick-start-playwright",
                "name": "Playwright Quick Start",
                "description": "Get started with Playwright quickly",
                "track": "playwright",
                "estimatedDuration": "2 hours",
                "totalLessons": 5,
                "difficulty": "beginner",
                "stages": [
                    {
                        "name": "Essentials",
                        "description": "Core concepts to get started",
                        "lessons": [
                            "pw-beginner-001",
                            "pw-beginner-002",
                            "pw-beginner-003",
                            "pw-beginner-004",
                            "pw-beginner-005"
                        ],
                        "estimatedDuration": "2 hours"
                    }
                ]
            },
            "quick-start-selenium": {
                "id": "quick-start-selenium",
                "name": "Selenium Quick Start",
                "description": "Get started with Selenium quickly",
                "track": "selenium",
                "estimatedDuration": "2 hours",
                "totalLessons": 5,
                "difficulty": "beginner",
                "stages": [
                    {
                        "name": "Essentials",
                        "description": "Core concepts to get started",
                        "lessons": [
                            "sel-beginner-001",
                            "sel-beginner-002",
                            "sel-beginner-003",
                            "sel-beginner-004",
                            "sel-beginner-005"
                        ],
                        "estimatedDuration": "2 hours"
                    }
                ]
            }
        },
        "milestones": {
            "playwright": [
                {
                    "name": "Playwright Basics",
                    "xpRequired": 1000,
                    "badge": "playwright-beginner",
                    "description": "Complete all beginner lessons"
                },
                {
                    "name": "Playwright Intermediate",
                    "xpRequired": 3000,
                    "badge": "playwright-intermediate",
                    "description": "Complete all intermediate lessons"
                },
                {
                    "name": "Playwright Master",
                    "xpRequired": 6000,
                    "badge": "playwright-master",
                    "description": "Complete all lessons"
                }
            ],
            "selenium": [
                {
                    "name": "Selenium Basics",
                    "xpRequired": 1000,
                    "badge": "selenium-beginner",
                    "description": "Complete all beginner lessons"
                },
                {
                    "name": "Selenium Intermediate",
                    "xpRequired": 3000,
                    "badge": "selenium-intermediate",
                    "description": "Complete all intermediate lessons"
                },
                {
                    "name": "Selenium Master",
                    "xpRequired": 6000,
                    "badge": "selenium-master",
                    "description": "Complete all lessons"
                }
            ]
        }
    }
    
    return curriculum

def main():
    base_path = "/Users/venkateshparasa/Documents/playWright/backend/data/lessons"
    
    # Load all lessons
    print("Loading lessons...")
    lessons = load_all_lessons(base_path)
    print(f"Loaded {len(lessons)} lessons")
    
    # Generate index
    print("Generating index.json...")
    index = generate_index(lessons)
    with open(os.path.join(base_path, "index.json"), 'w') as f:
        json.dump(index, f, indent=2)
    print("✅ Created index.json")
    
    # Generate curriculum
    print("Generating curriculum.json...")
    curriculum = generate_curriculum(lessons)
    with open(os.path.join(base_path, "curriculum.json"), 'w') as f:
        json.dump(curriculum, f, indent=2)
    print("✅ Created curriculum.json")
    
    print("\n🎉 All files generated successfully\!")
    print(f"   - Total lessons: {len(lessons)}")
    print(f"   - Playwright lessons: 30")
    print(f"   - Selenium lessons: 30")

if __name__ == "__main__":
    main()
