from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.documents import DocumentStatus
from app.modules.dashboard.dashboard_repository import DashboardRepository
from app.modules.dashboard.dashboard_schemas import DashboardSummaryOut, UnifiedDocumentOut

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DashboardRepository(db)

    async def get_summary(self) -> DashboardSummaryOut:
        return await self.repo.get_summary_kpis()

    async def get_documents(
        self,
        document_type: Optional[str] = None,
        status: Optional[DocumentStatus] = None,
        warehouse_id: Optional[int] = None,
        category_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[UnifiedDocumentOut], int]:
        return await self.repo.get_unified_documents(
            document_type=document_type,
            status=status,
            warehouse_id=warehouse_id,
            category_id=category_id,
            page=page,
            page_size=page_size,
        )
