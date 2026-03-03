from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    tags=["tokens"],
)

@router.post("/tokens", response_model=schemas.TokenUsageResponse, status_code=201)
def record_token_usage(
    token_data: schemas.TokenUsageCreate,
    db: DBSession = Depends(get_db)
):
    """Record a new token usage entry"""
    db_usage = models.TokenUsage(**token_data.dict())
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    return db_usage

@router.get("/tokens/by-project", response_model=schemas.TokenDashboardResponse)
def get_tokens_by_project(
    project_id: str = Query(..., description="Project ID to get token usage for"),
    start_date: Optional[datetime] = Query(None, description="Start date filter (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date filter (ISO format)"),
    db: DBSession = Depends(get_db)
):
    """
    Get aggregated token usage for a specific project.
    Used by Token Dashboard UI to display usage statistics.
    """
    # Base query filtered by project_id
    query = db.query(models.TokenUsage).filter(models.TokenUsage.project_id == project_id)
    
    # Apply date filters if provided
    if start_date:
        query = query.filter(models.TokenUsage.timestamp >= start_date)
    if end_date:
        query = query.filter(models.TokenUsage.timestamp <= end_date)
    
    # Get all records for this project
    records = query.all()
    
    if not records:
        # Return empty dashboard if no records
        return schemas.TokenDashboardResponse(
            project_id=project_id,
            summary=schemas.TokenProjectSummary(
                project_id=project_id,
                total_tokens=0,
                total_cost=0.0,
                agent_count=0,
                record_count=0
            ),
            by_agent=[],
            by_model=[],
            by_date=[]
        )
    
    # Calculate summary
    total_tokens = sum(r.total_tokens for r in records)
    total_cost = sum(r.cost for r in records)
    unique_agents = set(r.agent for r in records)
    
    summary = schemas.TokenProjectSummary(
        project_id=project_id,
        total_tokens=total_tokens,
        total_cost=total_cost,
        agent_count=len(unique_agents),
        record_count=len(records)
    )
    
    # Aggregate by agent
    agent_totals = {}
    for r in records:
        if r.agent not in agent_totals:
            agent_totals[r.agent] = {"tokens": 0, "cost": 0.0, "models": set()}
        agent_totals[r.agent]["tokens"] += r.total_tokens
        agent_totals[r.agent]["cost"] += r.cost
        agent_totals[r.agent]["models"].add(r.model)
    
    by_agent = [
        schemas.TokenAgentSummary(
            agent=agent,
            total_tokens=data["tokens"],
            total_cost=data["cost"],
            model_count=len(data["models"])
        )
        for agent, data in sorted(agent_totals.items(), key=lambda x: x[1]["tokens"], reverse=True)
    ]
    
    # Aggregate by model
    model_totals = {}
    for r in records:
        if r.model not in model_totals:
            model_totals[r.model] = {"tokens": 0, "cost": 0.0}
        model_totals[r.model]["tokens"] += r.total_tokens
        model_totals[r.model]["cost"] += r.cost
    
    by_model = [
        schemas.TokenModelSummary(
            model=model,
            total_tokens=data["tokens"],
            total_cost=data["cost"]
        )
        for model, data in sorted(model_totals.items(), key=lambda x: x[1]["tokens"], reverse=True)
    ]
    
    # Aggregate by date
    date_totals = {}
    for r in records:
        date_str = r.timestamp.strftime("%Y-%m-%d")
        if date_str not in date_totals:
            date_totals[date_str] = {"tokens": 0, "cost": 0.0}
        date_totals[date_str]["tokens"] += r.total_tokens
        date_totals[date_str]["cost"] += r.cost
    
    by_date = [
        {
            "date": date,
            "tokens": data["tokens"],
            "cost": float(data["cost"])
        }
        for date, data in sorted(date_totals.items())
    ]
    
    return schemas.TokenDashboardResponse(
        project_id=project_id,
        summary=summary,
        by_agent=by_agent,
        by_model=by_model,
        by_date=by_date
    )

@router.get("/tokens/projects", response_model=List[str])
def list_projects_with_token_usage(db: DBSession = Depends(get_db)):
    """Get list of all project IDs that have token usage records"""
    projects = db.query(models.TokenUsage.project_id).distinct().all()
    return [p[0] for p in projects]
