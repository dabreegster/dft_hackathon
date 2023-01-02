// Store data on thing added
export function store_feature(feature, features_all) {
  console.log(features_all);
  try {
    feature["speed"] = document.getElementById("speed").value;
    feature["frequency"] = document.getElementById("frequency").value;
    feature["type"] = "service";
  } catch (e) {
    let purpose = document.getElementById("purpose").value;
    feature["type"] = "newbuild";
    feature["form_value"] = get_newbuild_form_value(purpose);
    feature["purpose"] = purpose;
  }

  // add feature to features_all
  features_all.push(feature);

  return features_all;
}

export function collapse_sidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
  document.getElementById("form").innerHTML = "";
}

export function get_newbuild_form_value(purpose) {
  const key = {
    residential: "num_people",
    business: "num_jobs",
    shopping: "square_footage",
    leisure: "square_footage",
    education: "square_footage",
  }[purpose];
  const form_value = document.getElementById(key).value;
  if (form_value == "") {
    alert("Fill out the form first");
    return;
  } else {
    return form_value;
  }
}
