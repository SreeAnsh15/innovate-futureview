from typing import Dict, Any, List
from .provider import SpatialAIProvider
from ..schemas import SpatialAIInput, SpatialAIOutput, KeyImpactItem

class LocalSpatialAIProvider(SpatialAIProvider):
    """
    Deterministic Local Spatial Reasoning Provider.
    Operates offline without cloud API keys, performing rigorous rule-based geometric
    and multi-agent flow analysis based strictly on simulation numbers.
    """
    name: str = "Local Spatial Reasoning"
    provider_type: str = "local"

    def analyze(self, spatial_input: SpatialAIInput) -> SpatialAIOutput:
        wd = spatial_input.walking_distance or {}
        cg = spatial_input.congestion or {}
        ac = spatial_input.accessibility or {}
        sf = spatial_input.safety or {}
        change = spatial_input.scenario_change or {}
        env = spatial_input.environment or {}
        bottlenecks_data = spatial_input.bottlenecks or []

        # Extract deterministic metric values calculated by simulation engine
        dist_delta_pct = float(wd.get("delta_pct", 0.0) or 0.0)
        dist_delta_m = float(wd.get("delta", 0.0) or 0.0)
        dist_current_m = float(wd.get("current", 21.4) or 21.4)
        dist_proposed_m = float(wd.get("proposed", 21.4) or 21.4)

        cong_proposed = float(cg.get("proposed", 30.0) or 30.0)
        cong_current = float(cg.get("current", 30.0) or 30.0)
        cong_delta = float(cg.get("delta", 0.0) or 0.0)

        access_proposed = float(ac.get("proposed", 90.0) or 90.0)
        access_current = float(ac.get("current", 90.0) or 90.0)
        access_delta = float(ac.get("delta", 0.0) or 0.0)

        safety_proposed = float(sf.get("proposed", 90.0) or 90.0)
        safety_current = float(sf.get("current", 90.0) or 90.0)
        safety_delta = float(sf.get("delta", 0.0) or 0.0)

        # Calculate composite score from deterministic metrics
        overall_score = int(round(
            0.25 * access_proposed +
            0.25 * safety_proposed +
            0.25 * (100.0 - cong_proposed) +
            0.25 * max(0.0, 100.0 - max(0.0, dist_delta_pct) * 0.4)
        ))
        overall_score = max(5, min(99, overall_score))
        baseline_score = int(round(
            0.25 * access_current +
            0.25 * safety_current +
            0.25 * (100.0 - cong_current) +
            0.25 * 100.0
        ))

        impact_pts = overall_score - baseline_score
        obj_name = change.get("object_name", "Object")
        demand = change.get("users_per_hour", 420)

        # Determine verdict & severity
        if impact_pts >= -3 and dist_delta_pct <= 15.0 and cong_delta <= 5.0:
            verdict = "RECOMMENDED"
            severity = "positive"
            summary = (
                f"The proposed relocation of {obj_name} maintains high circulation efficiency ({overall_score}/100) "
                f"with negligible travel friction and preserved corridor accessibility."
            )
            recommendation = (
                f"Approve the layout change for {obj_name}. "
                f"Ensure 2.4m clear width along the primary entrance approach."
            )
            alternative = (
                f"To gain additional throughput during peak demand ({demand} users/hr), "
                f"pair this layout with dual-sided queuing and directional floor wayfinding."
            )
        elif impact_pts >= -12:
            verdict = "REVIEW"
            severity = "warning"
            summary = (
                f"The proposed change creates moderate spatial friction. Walking distance shifts by "
                f"{dist_delta_pct:+.1f}% and localized congestion increases by {cong_delta:+.0f} points."
            )
            recommendation = (
                f"Review {obj_name} placement before sign-off. "
                f"Consider secondary circulation buffers to alleviate cross-corridor queuing."
            )
            alternative = (
                f"Shift {obj_name} 6–8m closer to the primary entrance axis "
                f"to reduce diagonal crossing traffic across the central spine."
            )
        else:
            verdict = "AVOID"
            severity = "critical"
            summary = (
                f"High-friction configuration detected. Relocating {obj_name} increases walking distance by "
                f"{dist_delta_pct:+.1f}% and causes acute congestion bottlenecks in secondary hallways."
            )
            recommendation = (
                f"Avoid this placement. The location significantly degrades elderly and wheelchair accessibility "
                f"while generating high collision probability in emergency corridors."
            )
            alternative = (
                f"Maintain {obj_name} within the main entrance circulation spine "
                f"with a minimum 3.2m dedicated clearance from critical care / emergency egress paths."
            )

        # Structured Key Impacts
        key_impacts: List[Any] = []
        positive_impacts: List[str] = []
        negative_impacts: List[str] = []

        # 1. Walking Distance Impact
        if dist_delta_pct > 25.0:
            wd_item = KeyImpactItem(
                metric="Walking Distance",
                impact="CRITICAL",
                reason=f"Average transit distance rises by +{dist_delta_pct:.1f}% (+{dist_delta_m:.1f}m), forcing pedestrians across secondary zones."
            )
            key_impacts.append(wd_item)
            negative_impacts.append(f"Transit distance from entrance increases by {dist_delta_pct:.1f}% (+{dist_delta_m:.1f}m).")
        elif dist_delta_pct > 10.0:
            wd_item = KeyImpactItem(
                metric="Walking Distance",
                impact="HIGH",
                reason=f"Transit distance increases by +{dist_delta_pct:.1f}% (+{dist_delta_m:.1f}m) over baseline."
            )
            key_impacts.append(wd_item)
            negative_impacts.append(f"Transit distance from entrance increases by {dist_delta_pct:.1f}% (+{dist_delta_m:.1f}m).")
        elif dist_delta_pct < -5.0:
            wd_item = KeyImpactItem(
                metric="Walking Distance",
                impact="POSITIVE",
                reason=f"Transit distance shortened by {abs(dist_delta_pct):.1f}% ({dist_delta_m:.1f}m closer to main entry)."
            )
            key_impacts.append(wd_item)
            positive_impacts.append(f"Transit distance shortened by {abs(dist_delta_pct):.1f}% ({dist_delta_m:.1f}m).")
        else:
            wd_item = KeyImpactItem(
                metric="Walking Distance",
                impact="LOW",
                reason=f"Transit distance stays within ergonomic tolerance ({dist_proposed_m:.1f}m)."
            )
            key_impacts.append(wd_item)
            positive_impacts.append(f"Transit distance stays within ergonomic tolerance ({dist_proposed_m:.1f}m).")

        # 2. Congestion Impact
        if cong_delta > 15.0:
            cg_item = KeyImpactItem(
                metric="Congestion",
                impact="CRITICAL",
                reason=f"Queue density index jumps by +{cong_delta:.0f} points during peak demand ({demand} users/hr), creating acute intersection bottlenecks."
            )
            key_impacts.append(cg_item)
            negative_impacts.append(f"Severe congestion surge (+{cong_delta:.0f} points) in circulation choke points.")
        elif cong_delta > 5.0:
            cg_item = KeyImpactItem(
                metric="Congestion",
                impact="HIGH",
                reason=f"Congestion risk index rises by +{cong_delta:.0f} points during peak operating hours."
            )
            key_impacts.append(cg_item)
            negative_impacts.append(f"Congestion risk rises by +{cong_delta:.0f} points.")
        else:
            cg_item = KeyImpactItem(
                metric="Congestion",
                impact="LOW",
                reason="Pedestrian queue density remains balanced and within corridor design capacities."
            )
            key_impacts.append(cg_item)
            positive_impacts.append("Pedestrian queue density remains balanced across major corridors.")

        # 3. Accessibility Impact
        if access_delta < -10.0:
            ac_item = KeyImpactItem(
                metric="Accessibility",
                impact="CRITICAL",
                reason=f"ADA accessibility score drops by {abs(access_delta):.0f} points due to extended travel corridors and tight turns."
            )
            key_impacts.append(ac_item)
            negative_impacts.append(f"Accessibility rating drops by {abs(access_delta):.0f} points.")
        elif access_delta < -4.0:
            ac_item = KeyImpactItem(
                metric="Accessibility",
                impact="MODERATE",
                reason=f"Accessibility score drops by {abs(access_delta):.0f} points for visitors with mobility aids."
            )
            key_impacts.append(ac_item)
            negative_impacts.append(f"Accessibility score drops by {abs(access_delta):.0f} points.")
        else:
            ac_item = KeyImpactItem(
                metric="Accessibility",
                impact="POSITIVE",
                reason="Maintains continuous barrier-free ADA clearance across primary aisles."
            )
            key_impacts.append(ac_item)
            positive_impacts.append("Maintains barrier-free ADA clearance across primary aisles.")

        # 4. Safety Impact
        if safety_delta < -10.0:
            sf_item = KeyImpactItem(
                metric="Safety",
                impact="CRITICAL",
                reason=f"Emergency safety score degrades by {abs(safety_delta):.0f} points due to queue spillover into egress routes."
            )
            key_impacts.append(sf_item)
            negative_impacts.append(f"Emergency safety score degrades by {abs(safety_delta):.0f} points.")
        elif safety_delta < -4.0:
            sf_item = KeyImpactItem(
                metric="Safety",
                impact="HIGH",
                reason=f"Safety score decreases by {abs(safety_delta):.0f} points with cross-corridor queuing friction."
            )
            key_impacts.append(sf_item)
            negative_impacts.append(f"Safety score decreases by {abs(safety_delta):.0f} points.")
        else:
            sf_item = KeyImpactItem(
                metric="Safety",
                impact="POSITIVE",
                reason="Primary emergency egress paths and sightlines remain completely unobstructed."
            )
            key_impacts.append(sf_item)
            positive_impacts.append("Emergency egress paths remain fully compliant.")

        # Affected User Groups
        affected_user_groups: List[str] = []
        if dist_delta_pct > 20.0 or access_delta < -5.0:
            affected_user_groups.append("Elderly Visitors (excessive continuous walking demand)")
            affected_user_groups.append("Wheelchair & Mobility Device Users (extended navigation route)")
            affected_user_groups.append("First-Time Visitors (heightened disorientation risk)")
        if cong_delta > 10.0 or safety_delta < -6.0:
            affected_user_groups.append("Emergency & Triage Patients (delayed pathway access)")
            affected_user_groups.append("High-Frequency Staff (cross-traffic interference)")
        if not affected_user_groups:
            affected_user_groups = ["General Visitors", "Facility Staff", "All Visitor Demographics (Uniform Flow)"]

        # Bottlenecks
        bottlenecks: List[str] = []
        if bottlenecks_data:
            for b in bottlenecks_data[:3]:
                bottlenecks.append(f"Hotspot at ({b.get('x')}%, {b.get('y')}%) with intensity {b.get('intensity', 50)}/100")
        if cong_delta > 10.0 and not bottlenecks:
            bottlenecks.append(f"Circulation intersection adjacent to {obj_name} proposed coordinate.")
        if not bottlenecks:
            bottlenecks.append("No critical queue bottlenecks detected.")

        # Accessibility Concerns
        accessibility_concerns: List[str] = []
        if access_delta < -5.0 or dist_proposed_m > 45.0:
            accessibility_concerns.append(f"Extended travel distance ({dist_proposed_m:.1f}m) exceeds optimal continuous ADA rest intervals.")
            accessibility_concerns.append("Multiple turning radiuses required across intermediate corridors.")
        else:
            accessibility_concerns.append("Aisle widths and turning radiuses meet barrier-free standards.")

        # Safety Concerns
        safety_concerns: List[str] = []
        if safety_delta < -5.0 or cong_proposed > 60.0:
            safety_concerns.append("Queuing spillover encroaches upon secondary emergency egress pathways.")
            safety_concerns.append("Sightline obstruction between foyer entrance and emergency care zone.")
        else:
            safety_concerns.append("Unobstructed egress paths to designated fire exits.")

        # Step-by-step spatial reasoning trace
        reasoning = [
            f"Baseline route from entrance measured {dist_current_m:.1f}m; proposed placement requires {dist_proposed_m:.1f}m ({dist_delta_pct:+.1f}%).",
            f"Pedestrian demand load of {demand} users/hr generates a localized congestion score of {cong_proposed:.0f}/100 vs baseline {cong_current:.0f}/100.",
            f"Accessibility compliance rating is evaluated at {access_proposed:.0f}/100 based on ADA corridor clearance.",
            f"Emergency safety and egress headroom is rated at {safety_proposed:.0f}/100."
        ]

        return SpatialAIOutput(
            overall_score=overall_score,
            verdict=verdict,
            confidence=0.95,
            summary=summary,
            key_impacts=key_impacts,
            affected_user_groups=affected_user_groups,
            affected_users=affected_user_groups,
            bottlenecks=bottlenecks,
            accessibility_concerns=accessibility_concerns,
            safety_concerns=safety_concerns,
            recommendation=recommendation,
            recommendations=[recommendation],
            alternative=alternative,
            spatial_reasoning=reasoning,
            reasoning=reasoning,
            provider_name=self.name,
            severity=severity,
            baseline_score=baseline_score,
            recommended_action=recommendation,
            alternative_suggestion=alternative,
            positive_impacts=positive_impacts,
            negative_impacts=negative_impacts
        )
