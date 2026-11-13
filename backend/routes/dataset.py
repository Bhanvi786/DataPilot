from fastapi import APIRouter, Query, HTTPException
from schemas.dataset_schema import DatasetInfoResponse, DatasetPreviewResponse, DeleteResponse
from services.dataset_service import get_dataset_info, get_dataset_page, delete_dataset

router = APIRouter(prefix="/dataset", tags=["Dataset"])

@router.get("/{dataset_id}", response_model=DatasetInfoResponse)
def get_dataset_info_endpoint(dataset_id: str):
    """Returns dataset metadata, column types, and first 10 rows."""
    return get_dataset_info(dataset_id)

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def get_dataset_preview_endpoint(
    dataset_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Rows per page")
):
    """Returns paginated tabular rows for dynamic preview."""
    return get_dataset_page(dataset_id, page=page, page_size=page_size)

@router.delete("/{dataset_id}", response_model=DeleteResponse)
def delete_dataset_endpoint(dataset_id: str):
    """Removes dataset from storage and active cache."""
    delete_dataset(dataset_id)
    return DeleteResponse(
        status="success",
        dataset_id=dataset_id,
        message=f"Dataset '{dataset_id}' successfully removed from storage."
    )

