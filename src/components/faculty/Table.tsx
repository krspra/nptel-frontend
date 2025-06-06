import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const headings = [
  "Subject Code",
  "Subject Name",
  "Actions",
  "Request Status",
];

export type Subject ={
  "id": string;
  "name" : string;
  "subject_code" : string;
  "teacher_id" : string;
}

export type ApiResponse = {
  subjects: Subject[];
}

const fetchData = async ()=>{
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const {data} = await axios.get<ApiResponse>(
    `${apiUrl}/teacher/subjects`,
    {
      withCredentials: true,
    }
  )

  // console.log(data);

  return data;
 
}

const Table = function () {
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ["teacherRequests"],
    queryFn: fetchData,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
        <p>Error loading subjects: {(error as Error).message}</p>
      </div>
    );
  }

  if (!apiData || apiData.subjects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">No subjects found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg shadow-sm border border-gray-100 bg-white max-w-7xl mx-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="text-sm font-medium text-gray-700">
            {headings.map((heading, idx) => (
              <th key={idx} className="px-6 py-4 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {apiData.subjects.map((subject) => (
            <tr
              key={subject.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4">{subject.subject_code}</td>
              <td className="px-6 py-4">{subject.name}</td>
              <td className="px-6 py-4">
                <Link 
                  to={`/faculty/students/${subject.subject_code}`} 
                  state={{ subjectId: subject.id }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200"
                >
                  View Students
                  <FaArrowRight className="ml-2 text-sm" />
                </Link>
              </td>
              <td className="px-6 py-4">
                <Link 
                  to={`/faculty/students/requests/${subject.subject_code}`} 
                  state={{ subjectId: subject.id }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200"
                >
                  Request Status
                  <FaArrowRight className="ml-2 text-sm" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
