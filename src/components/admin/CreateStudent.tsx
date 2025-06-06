import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface StudentForm {
  name: string;
  email: string;
  password: string;
  roll_number: string;
}

const postStudents = async (students: StudentForm[]) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await axios.post(
    `${apiUrl}/admin/create/students`,
    students,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

const CreateStudent = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [students, setStudents] = useState<StudentForm[]>([
    {
      name: "",
      email: "",
      password: "",
      roll_number: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // React Query mutation for creating students

  const mutation = useMutation({
    mutationFn: postStudents,
    onSuccess: () => {
      setSuccessMessage(`Successfully created students`);
      setStudents([{ name: "", email: "", password: "", roll_number: "" }]);
      setIsSubmitting(false);
    },
    onError: () => {
      setError("Failed to create students");
      setIsSubmitting(false);
    },
  });

  // CSV file upload

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvFile(e.target.files?.[0] || null);
  };

  const handleCSVUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim());
      const studentsFromCSV = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const student: any = {};
        headers.forEach((header, i) => {
          student[header] = values[i];
        });
        console.log(student);
        return student;
      });
      setIsSubmitting(true)
      mutation.mutate(studentsFromCSV);
    };
    reader.readAsText(csvFile);
  };

  // Handlers for adding/removing students

  const handleAddStudent = () => {
    setStudents([
      ...students,
      { name: "", email: "", password: "", roll_number: "" },
    ]);
  };

  const handleRemoveStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index);
    setStudents(updatedStudents);
  };

  const handleChange = (
    index: number,
    field: keyof StudentForm,
    value: string
  ) => {
    const updatedStudents = [...students];
    updatedStudents[index] = {
      ...updatedStudents[index],
      [field]: value,
    };
    setStudents(updatedStudents);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const isValid = students.every(
      (student) =>
        student.name.trim() !== "" &&
        student.email.trim() !== "" &&
        student.password.trim() !== "" &&
        student.roll_number.trim() !== ""
    );

    if (!isValid) {
      setError("Please fill in all fields for each student.");
      return;
    }

    // Mock form submission
    setIsSubmitting(true);
    setError(null);

    mutation.mutate(students);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Students</h2>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-600 rounded">
          {error}
        </div>
      )}


      {/* CSV Upload Section */}

      <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Import Students via CSV</h3>

        <form
          onSubmit={handleCSVUpload}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVChange}
            ref={fileInputRef}
            style={{ display: "none" }}
            className="file-input file-input-neutral"
          />

          <button
            type="button"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => fileInputRef.current?.click()}
          >
            Select CSV File
          </button>

          {csvFile ? (
            <div className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 truncate max-w-xs">
              {csvFile.name}
            </div>
          ) : (
            <div className="flex-1 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-md text-sm text-gray-400">
              No file selected
            </div>
          )}

          <button
            type="submit"
            disabled={!csvFile}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              !isSubmitting
                ? "btn btn-neutral hover:bg-gray-800"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Students"}
          </button>
        </form>

        <p className="mt-3 text-xs text-gray-500">
          CSV should include columns with headings as name, email, password, and
          roll_number
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {students.map((student, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Student {index + 1}</h3>
              {students.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStudent(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={student.email}
                  onChange={(e) => handleChange(index, "email", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={student.password}
                  onChange={(e) =>
                    handleChange(index, "password", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={student.roll_number}
                  onChange={(e) =>
                    handleChange(index, "roll_number", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleAddStudent}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            + Add Another Student
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Students"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudent;
