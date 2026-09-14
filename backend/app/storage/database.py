import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "futureview.db")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS environments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size TEXT NOT NULL,
        width_m REAL DEFAULT 120,
        height_m REAL DEFAULT 80,
        image_url TEXT,
        objects TEXT NOT NULL,
        zones TEXT,
        walkable_regions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        environment_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        change_type TEXT DEFAULT 'move',
        object_id TEXT NOT NULL,
        object_name TEXT NOT NULL,
        from_x REAL NOT NULL,
        from_y REAL NOT NULL,
        to_x REAL NOT NULL,
        to_y REAL NOT NULL,
        users_per_hour INTEGER DEFAULT 420,
        verdict TEXT,
        score INTEGER,
        baseline_score INTEGER,
        is_recommended BOOLEAN DEFAULT 0,
        is_baseline BOOLEAN DEFAULT 0,
        simulation_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        environment_id TEXT NOT NULL,
        title TEXT NOT NULL,
        executive_summary TEXT,
        metrics_json TEXT,
        ai_analysis_json TEXT,
        recommendations_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    seed_default_data(conn)
    conn.close()

def seed_default_data(conn):
    cursor = conn.cursor()
    
    # Check if default environment already exists
    if cursor.execute("SELECT COUNT(*) FROM environments").fetchone()[0] == 0:
        metrocare_objects = [
            {"id":"entrance","name":"Emergency Ingress Foyer","kind":"entrance","x":10,"y":40,"w":15,"h":18,"movable":False,"critical":True,"capacity":120,"accessibility_priority":"critical"},
            {"id":"registration","name":"Registration Desk","kind":"service","x":38,"y":40,"w":18,"h":9,"movable":True,"critical":True,"capacity":45,"accessibility_priority":"high"},
            {"id":"waiting","name":"Patient Waiting Lounge","kind":"room","x":68,"y":22,"w":25,"h":20,"movable":False,"critical":False,"capacity":80,"accessibility_priority":"medium"},
            {"id":"emergency","name":"Emergency Triage Dept","kind":"critical","x":68,"y":57,"w":25,"h":16,"movable":False,"critical":True,"capacity":35,"accessibility_priority":"critical"},
            {"id":"pharmacy","name":"Outpatient Pharmacy","kind":"service","x":92,"y":57,"w":18,"h":16,"movable":False,"critical":False,"capacity":25,"accessibility_priority":"medium"},
            {"id":"corridor","name":"Main Clinical Spine","kind":"corridor","x":28,"y":36,"w":70,"h":14,"movable":False,"critical":False,"capacity":200,"accessibility_priority":"high"},
            {"id":"triage_kiosk","name":"Self-Check-in Kiosk","kind":"service","x":30,"y":20,"w":10,"h":8,"movable":True,"critical":False,"capacity":20,"accessibility_priority":"medium"},
            {"id":"accessible_ramp","name":"Barrier-Free ADA Ramp","kind":"service","x":18,"y":28,"w":12,"h":6,"movable":True,"critical":False,"capacity":30,"accessibility_priority":"high"},
            {"id":"secondary_exit","name":"East Emergency Egress Gate","kind":"exit","x":95,"y":24,"w":8,"h":14,"movable":False,"critical":True,"capacity":150,"accessibility_priority":"critical"}
        ]
        
        school_objects = [
            {"id":"school_gate","name":"Main Campus Ingress Gate","kind":"entrance","x":10,"y":45,"w":16,"h":20,"movable":False,"critical":True,"capacity":300,"accessibility_priority":"high"},
            {"id":"admin_reception","name":"Administration Helpdesk","kind":"service","x":36,"y":45,"w":18,"h":12,"movable":True,"critical":True,"capacity":60,"accessibility_priority":"high"},
            {"id":"primary_wing","name":"Primary Academic Wing (Grades 1-5)","kind":"room","x":70,"y":20,"w":26,"h":22,"movable":False,"critical":False,"capacity":200,"accessibility_priority":"high"},
            {"id":"secondary_wing","name":"Secondary Science Block","kind":"room","x":70,"y":62,"w":28,"h":24,"movable":False,"critical":True,"capacity":250,"accessibility_priority":"high"},
            {"id":"assembly_ground","name":"Central Morning Assembly Foyer","kind":"corridor","x":24,"y":38,"w":72,"h":18,"movable":False,"critical":False,"capacity":400,"accessibility_priority":"high"},
            {"id":"midday_meal_hall","name":"Midday Dining & Nutrition Hall","kind":"service","x":92,"y":45,"w":16,"h":16,"movable":True,"critical":False,"capacity":150,"accessibility_priority":"medium"}
        ]

        transit_objects = [
            {"id":"terminal_entry","name":"Curbside Terminal Entry","kind":"entrance","x":10,"y":45,"w":14,"h":22,"movable":False,"critical":True,"capacity":350,"accessibility_priority":"high"},
            {"id":"tsa_checkpoint","name":"Smart Security Screening Bank","kind":"service","x":36,"y":45,"w":18,"h":12,"movable":True,"critical":True,"capacity":150,"accessibility_priority":"critical"},
            {"id":"duty_free_kiosk","name":"Duty-Free Retail Pavilion","kind":"service","x":58,"y":22,"w":22,"h":14,"movable":True,"critical":False,"capacity":80,"accessibility_priority":"medium"},
            {"id":"gate_cluster_a","name":"Boarding Platforms 1-6","kind":"room","x":80,"y":22,"w":26,"h":24,"movable":False,"critical":True,"capacity":450,"accessibility_priority":"high"},
            {"id":"gate_cluster_b","name":"Boarding Platforms 7-12","kind":"room","x":80,"y":62,"w":26,"h":24,"movable":False,"critical":True,"capacity":450,"accessibility_priority":"high"},
            {"id":"concourse_spine","name":"Central Concourse Interchange Spine","kind":"corridor","x":24,"y":38,"w":74,"h":20,"movable":False,"critical":False,"capacity":600,"accessibility_priority":"high"}
        ]

        evac_objects = [
            {"id":"lab_entrance","name":"Research Chamber Airlock Entry","kind":"entrance","x":10,"y":40,"w":14,"h":18,"movable":False,"critical":True,"capacity":100,"accessibility_priority":"high"},
            {"id":"test_rig_alpha","name":"High-Pressure Combustion Rig Alpha","kind":"critical","x":40,"y":40,"w":20,"h":14,"movable":False,"critical":True,"capacity":20,"accessibility_priority":"critical"},
            {"id":"control_sanctum","name":"Command & Telemetry Bunker","kind":"room","x":70,"y":20,"w":24,"h":20,"movable":False,"critical":True,"capacity":40,"accessibility_priority":"high"},
            {"id":"hazmat_containment","name":"Hazardous Materials Storage Cell","kind":"room","x":70,"y":60,"w":24,"h":20,"movable":False,"critical":True,"capacity":30,"accessibility_priority":"critical"},
            {"id":"blast_escape_chute","name":"Pressurized Fire Blast Egress Port","kind":"exit","x":92,"y":40,"w":12,"h":16,"movable":False,"critical":True,"capacity":200,"accessibility_priority":"critical"},
            {"id":"isolation_corridor","name":"Reinforced Hazard Isolation Corridor","kind":"corridor","x":25,"y":36,"w":68,"h":16,"movable":False,"critical":True,"capacity":150,"accessibility_priority":"critical"}
        ]

        # 1. MetroCare Emergency Department (Primary Demo Environment)
        cursor.execute("""
        INSERT INTO environments (id, name, type, size, width_m, height_m, objects, zones, walkable_regions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "hospital-demo", "MetroCare Emergency Department", "Healthcare", "120 × 80 m", 120.0, 80.0,
            json.dumps(metrocare_objects), json.dumps([{"id":"z1","name":"Critical Clinical Zone","color":"#f43f5e"},{"id":"z2","name":"Barrier-Free Circulation Spine","color":"#38bdf8"}]),
            json.dumps([{"x1":5,"y1":5,"x2":95,"y2":95}])
        ))

        # 2. Bharat Public School
        cursor.execute("""
        INSERT INTO environments (id, name, type, size, width_m, height_m, objects, zones, walkable_regions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "school-demo", "Bharat Public School", "Education & Campus", "100 × 75 m", 100.0, 75.0,
            json.dumps(school_objects), json.dumps([{"id":"z_sch_1","name":"Student Rush Corridor","color":"#f59e0b"},{"id":"z_sch_2","name":"Quiet Classroom Zone","color":"#10b981"}]),
            json.dumps([{"x1":5,"y1":5,"x2":95,"y2":95}])
        ))

        # 3. Central Transit Interchange
        cursor.execute("""
        INSERT INTO environments (id, name, type, size, width_m, height_m, objects, zones, walkable_regions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "transit-demo", "Central Transit Interchange", "Aviation & Transit", "150 × 100 m", 150.0, 100.0,
            json.dumps(transit_objects), json.dumps([{"id":"z_air_1","name":"Secure Sterile Concourse","color":"#818cf8"},{"id":"z_air_2","name":"Pre-Security Checkpoint Zone","color":"#fbbf24"}]),
            json.dumps([{"x1":5,"y1":5,"x2":95,"y2":95}])
        ))

        # 4. Rapid Fire Evacuation Lab
        cursor.execute("""
        INSERT INTO environments (id, name, type, size, width_m, height_m, objects, zones, walkable_regions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "evac-demo", "Rapid Fire Evacuation Lab", "Safety & Emergency Lab", "90 × 65 m", 90.0, 65.0,
            json.dumps(evac_objects), json.dumps([{"id":"z_evac_1","name":"High-Thermal Hazard Zone","color":"#f43f5e"},{"id":"z_evac_2","name":"Pressurized Safe Egress Spine","color":"#06b6d4"}]),
            json.dumps([{"x1":5,"y1":5,"x2":95,"y2":95}])
        ))


        # Seed initial demo scenarios
        cursor.execute("""
        INSERT INTO scenarios (id, environment_id, name, description, change_type, object_id, object_name, from_x, from_y, to_x, to_y, users_per_hour, verdict, score, baseline_score, is_recommended, is_baseline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "scenario-baseline", "hospital-demo", "Current Baseline Layout", "Current operational layout with registration desk at entrance spine.",
            "baseline", "registration", "Registration Desk", 38.0, 40.0, 38.0, 40.0, 420, "RECOMMENDED", 85, 85, 1, 1
        ))

        cursor.execute("""
        INSERT INTO scenarios (id, environment_id, name, description, change_type, object_id, object_name, from_x, from_y, to_x, to_y, users_per_hour, verdict, score, baseline_score, is_recommended, is_baseline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "scenario-relocate-far", "hospital-demo", "Relocate Registration to East Wing", "Proposed relocation moving registration desk deep into the eastern corridor.",
            "move", "registration", "Registration Desk", 38.0, 40.0, 75.0, 45.0, 420, "AVOID", 44, 85, 0, 0
        ))

        cursor.execute("""
        INSERT INTO scenarios (id, environment_id, name, description, change_type, object_id, object_name, from_x, from_y, to_x, to_y, users_per_hour, verdict, score, baseline_score, is_recommended, is_baseline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "scenario-optimize-entry", "hospital-demo", "Optimized Entrance Kiosk Cluster", "Relocate registration 5m closer to entrance with dual-side access.",
            "move", "registration", "Registration Desk", 38.0, 40.0, 28.0, 38.0, 420, "RECOMMENDED", 94, 85, 1, 0
        ))

        conn.commit()

init_db()
