{userRole !== "admin" && (
  <>
    <Button
      className="btn-gradient btn-pill btn-icon"
      onClick={handletoCreateJob}
    >
      <FaPlus /> สร้างงานซ่อม
    </Button>

    <Button
      className="btn-pill btn-icon"
      variant={isEditing ? "outline-danger" : "outline-secondary"}
      onClick={handleEditStatus}
    >
      <MdEditDocument /> {isEditing ? "ยกเลิกการแก้ไข" : "แก้ไขสถานะ"}
    </Button>

    {isEditing && hasChanges && (
      <Button
        className="btn-pill btn-icon"
        variant="success"
        onClick={() => {
          handleConfirm();
          setOpen(true);
        }}
      >
        <MdEditDocument /> ยืนยันการแก้ไขสถานะ
      </Button>
    )}
  </>
)}